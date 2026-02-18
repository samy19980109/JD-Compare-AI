from typing import Literal

from pydantic import BaseModel


class JDInput(BaseModel):
    id: str
    text: str
    label_title: str | None = None
    label_company: str | None = None
    is_muted: bool = False


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    jd_cards: list[JDInput]
    messages: list[ChatMessage]
    user_message: str
    provider: Literal["openai", "anthropic"] = "openai"
    model: str | None = None
