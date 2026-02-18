from typing import Literal

from pydantic import BaseModel


class LabelRequest(BaseModel):
    text: str
    provider: Literal["openai", "anthropic"] = "openai"


class LabelResponse(BaseModel):
    title: str | None = None
    company: str | None = None
