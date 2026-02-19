import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.jd_set import JDSet
from app.models.jd_item import JDItem
from app.models.chat_session import ChatSession, ChatMessage
from app.schemas.jd_set import (
    BulkItemsSync,
    ChatMessageResponse,
    JDItemResponse,
    JDSetCreate,
    JDSetDetail,
    JDSetUpdate,
)

router = APIRouter()


def _set_to_detail(jd_set: JDSet) -> JDSetDetail:
    """Convert ORM JDSet (with loaded relations) to JDSetDetail response."""
    # Collect all chat messages across all sessions, ordered by created_at
    all_messages: list[ChatMessage] = []
    for session in jd_set.chat_sessions:
        all_messages.extend(session.messages)
    all_messages.sort(key=lambda m: m.created_at)

    items_sorted = sorted(jd_set.items, key=lambda i: i.sort_order)

    return JDSetDetail(
        id=str(jd_set.id),
        name=jd_set.name,
        items=[
            JDItemResponse(
                id=str(item.id),
                raw_text=item.raw_text,
                label_title=item.label_title,
                label_company=item.label_company,
                is_muted=item.is_muted,
                sort_order=item.sort_order,
                created_at=item.created_at,
            )
            for item in items_sorted
        ],
        chat_messages=[
            ChatMessageResponse(
                id=str(msg.id),
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at,
            )
            for msg in all_messages
        ],
        updated_at=jd_set.updated_at,
    )


@router.post("", response_model=JDSetDetail)
async def create_jd_set(body: JDSetCreate, db: AsyncSession = Depends(get_db)):
    jd_set = JDSet(name=body.name or "Untitled Workspace")
    jd_set.user_id = None
    db.add(jd_set)
    await db.commit()
    await db.refresh(jd_set)
    # Eager load empty relations
    jd_set.items = []
    jd_set.chat_sessions = []
    return _set_to_detail(jd_set)


@router.get("/{jd_set_id}", response_model=JDSetDetail)
async def get_jd_set(jd_set_id: str, db: AsyncSession = Depends(get_db)):
    try:
        set_uuid = uuid.UUID(jd_set_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID")

    result = await db.execute(
        select(JDSet)
        .where(JDSet.id == set_uuid)
        .options(
            selectinload(JDSet.items),
            selectinload(JDSet.chat_sessions).selectinload(ChatSession.messages),
        )
    )
    jd_set = result.scalar_one_or_none()
    if not jd_set:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return _set_to_detail(jd_set)


@router.put("/{jd_set_id}", response_model=JDSetDetail)
async def update_jd_set(
    jd_set_id: str, body: JDSetUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        set_uuid = uuid.UUID(jd_set_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID")

    result = await db.execute(
        select(JDSet)
        .where(JDSet.id == set_uuid)
        .options(
            selectinload(JDSet.items),
            selectinload(JDSet.chat_sessions).selectinload(ChatSession.messages),
        )
    )
    jd_set = result.scalar_one_or_none()
    if not jd_set:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if body.name is not None:
        jd_set.name = body.name

    await db.commit()
    await db.refresh(jd_set)

    # Re-load relations after refresh
    result = await db.execute(
        select(JDSet)
        .where(JDSet.id == set_uuid)
        .options(
            selectinload(JDSet.items),
            selectinload(JDSet.chat_sessions).selectinload(ChatSession.messages),
        )
    )
    jd_set = result.scalar_one_or_none()
    return _set_to_detail(jd_set)


@router.delete("/{jd_set_id}")
async def delete_jd_set(jd_set_id: str, db: AsyncSession = Depends(get_db)):
    try:
        set_uuid = uuid.UUID(jd_set_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID")

    result = await db.execute(select(JDSet).where(JDSet.id == set_uuid))
    jd_set = result.scalar_one_or_none()
    if not jd_set:
        raise HTTPException(status_code=404, detail="Workspace not found")

    await db.delete(jd_set)
    await db.commit()
    return {"ok": True}


@router.put("/{jd_set_id}/items", response_model=list[JDItemResponse])
async def bulk_sync_items(
    jd_set_id: str, body: BulkItemsSync, db: AsyncSession = Depends(get_db)
):
    """
    Bulk sync: frontend sends all current cards. Backend upserts matching IDs
    and deletes any DB items not in the incoming list.
    """
    try:
        set_uuid = uuid.UUID(jd_set_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID")

    # Verify workspace exists
    result = await db.execute(select(JDSet).where(JDSet.id == set_uuid))
    jd_set = result.scalar_one_or_none()
    if not jd_set:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Get existing items
    result = await db.execute(select(JDItem).where(JDItem.jd_set_id == set_uuid))
    existing_items = {str(item.id): item for item in result.scalars().all()}

    incoming_ids: set[str] = set()
    response_items: list[JDItem] = []

    for idx, item_data in enumerate(body.items):
        item_id = item_data.id

        # Try to match to existing item
        if item_id and item_id in existing_items:
            # Update existing
            item = existing_items[item_id]
            item.raw_text = item_data.raw_text
            item.label_title = item_data.label_title
            item.label_company = item_data.label_company
            item.is_muted = item_data.is_muted
            item.sort_order = idx
            incoming_ids.add(item_id)
            response_items.append(item)
        else:
            # Create new item, preserving client-provided ID if valid UUID
            new_item = JDItem(
                jd_set_id=set_uuid,
                raw_text=item_data.raw_text,
                label_title=item_data.label_title,
                label_company=item_data.label_company,
                is_muted=item_data.is_muted,
                sort_order=idx,
            )
            if item_id:
                try:
                    new_item.id = uuid.UUID(item_id)
                    incoming_ids.add(item_id)
                except ValueError:
                    pass  # Let DB generate ID
            db.add(new_item)
            response_items.append(new_item)

    # Delete items no longer present
    for existing_id, item in existing_items.items():
        if existing_id not in incoming_ids:
            await db.delete(item)

    # Touch updated_at on the jd_set
    jd_set.name = jd_set.name  # triggers onupdate

    await db.commit()

    # Refresh all items to get server-generated timestamps
    for item in response_items:
        await db.refresh(item)

    response_items.sort(key=lambda i: i.sort_order)

    return [
        JDItemResponse(
            id=str(item.id),
            raw_text=item.raw_text,
            label_title=item.label_title,
            label_company=item.label_company,
            is_muted=item.is_muted,
            sort_order=item.sort_order,
            created_at=item.created_at,
        )
        for item in response_items
    ]
