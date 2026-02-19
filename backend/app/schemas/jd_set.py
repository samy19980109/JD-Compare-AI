from datetime import datetime

from pydantic import BaseModel


# --- JD Set ---

class JDSetCreate(BaseModel):
    name: str | None = None


class JDSetUpdate(BaseModel):
    name: str | None = None


class JDSetSummary(BaseModel):
    id: str
    name: str
    item_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- JD Items ---

class JDItemUpsert(BaseModel):
    id: str | None = None
    raw_text: str
    label_title: str | None = None
    label_company: str | None = None
    is_muted: bool = False
    sort_order: int = 0


class JDItemResponse(BaseModel):
    id: str
    raw_text: str
    label_title: str | None
    label_company: str | None
    is_muted: bool
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class BulkItemsSync(BaseModel):
    items: list[JDItemUpsert]


# --- Chat Messages ---

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Full Workspace Detail ---

class JDSetDetail(BaseModel):
    id: str
    name: str
    items: list[JDItemResponse]
    chat_messages: list[ChatMessageResponse]
    updated_at: datetime

    model_config = {"from_attributes": True}
