import json
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.chat_session import ChatMessage as ChatMessageModel, ChatSession
from app.schemas.chat import ChatRequest
from app.services.llm.factory import get_provider
from app.services.llm.prompt_builder import build_prompt_parts

router = APIRouter()


async def _get_or_create_session(
    jd_set_id: uuid.UUID, db: AsyncSession
) -> ChatSession:
    """Get existing chat session for a JD set, or create one."""
    result = await db.execute(
        select(ChatSession).where(ChatSession.jd_set_id == jd_set_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        session = ChatSession(jd_set_id=jd_set_id)
        db.add(session)
        await db.commit()
        await db.refresh(session)
    return session


@router.post("/stream")
async def stream_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    provider = get_provider(request.provider)
    prompt_parts = build_prompt_parts(request)

    # Resolve chat session if workspace ID provided
    chat_session: ChatSession | None = None
    if request.jd_set_id:
        try:
            set_uuid = uuid.UUID(request.jd_set_id)
            chat_session = await _get_or_create_session(set_uuid, db)
            # Persist user message
            user_msg = ChatMessageModel(
                session_id=chat_session.id,
                role="user",
                content=request.user_message,
            )
            db.add(user_msg)
            await db.commit()
        except ValueError:
            chat_session = None  # Invalid UUID, skip persistence

    async def event_generator():
        collected_tokens: list[str] = []
        try:
            async for token in provider.stream_chat(prompt_parts):
                collected_tokens.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            # Persist assistant message after streaming completes
            if chat_session and collected_tokens:
                full_response = "".join(collected_tokens)
                assistant_msg = ChatMessageModel(
                    session_id=chat_session.id,
                    role="assistant",
                    content=full_response,
                )
                db.add(assistant_msg)
                await db.commit()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
