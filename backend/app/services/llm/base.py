from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator

from app.schemas.chat import ChatMessage, JDInput


@dataclass
class PromptParts:
    system_instructions: str
    jd_block: str
    history: list[ChatMessage]
    user_message: str


class LLMProvider(ABC):
    @abstractmethod
    async def stream_chat(self, prompt_parts: PromptParts) -> AsyncIterator[str]:
        """Yield tokens as they are generated."""
        ...

    @abstractmethod
    async def extract_label(self, jd_text: str) -> dict[str, str | None]:
        """Extract job title and company name from JD text."""
        ...
