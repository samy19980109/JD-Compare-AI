import json
from typing import AsyncIterator

from anthropic import AsyncAnthropic

from app.config import settings
from app.services.llm.base import LLMProvider, PromptParts


class AnthropicProvider(LLMProvider):
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.chat_model = settings.anthropic_chat_model
        self.label_model = settings.anthropic_label_model

    async def stream_chat(self, prompt_parts: PromptParts) -> AsyncIterator[str]:
        # Explicit cache_control breakpoints for Anthropic prompt caching
        system_blocks = [
            {
                "type": "text",
                "text": prompt_parts.system_instructions,
                "cache_control": {"type": "ephemeral"},  # Breakpoint 1
            },
            {
                "type": "text",
                "text": prompt_parts.jd_block,
                "cache_control": {"type": "ephemeral"},  # Breakpoint 2
            },
        ]

        messages = []
        history = prompt_parts.history

        for i, msg in enumerate(history):
            content = [{"type": "text", "text": msg.content}]
            # Cache breakpoint on last history message
            if i == len(history) - 1:
                content[0]["cache_control"] = {"type": "ephemeral"}  # Breakpoint 3
            messages.append({"role": msg.role, "content": content})

        # Latest user message (never cached)
        messages.append({
            "role": "user",
            "content": [{"type": "text", "text": prompt_parts.user_message}],
        })

        # Ensure messages alternate roles (Anthropic requires this)
        messages = self._ensure_alternating_roles(messages)

        async with self.client.messages.stream(
            model=self.chat_model,
            max_tokens=4096,
            system=system_blocks,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def extract_label(self, jd_text: str) -> dict[str, str | None]:
        truncated = jd_text[:3000]

        response = await self.client.messages.create(
            model=self.label_model,
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Extract the job title and company name from the following "
                        "job description. Return ONLY valid JSON: "
                        '{\"title\": \"...\", \"company\": \"...\"}. '
                        "If not found, use null for that field.\n\n"
                        f"{truncated}"
                    ),
                }
            ],
        )

        content = response.content[0].text
        try:
            parsed = json.loads(content)
            return {
                "title": parsed.get("title"),
                "company": parsed.get("company"),
            }
        except (json.JSONDecodeError, AttributeError, IndexError):
            return {"title": None, "company": None}

    @staticmethod
    def _ensure_alternating_roles(messages: list[dict]) -> list[dict]:
        """Anthropic requires strictly alternating user/assistant roles."""
        if not messages:
            return messages

        result = [messages[0]]
        for msg in messages[1:]:
            if msg["role"] == result[-1]["role"]:
                # Merge content into previous message of same role
                prev_content = result[-1]["content"]
                curr_content = msg["content"]
                if isinstance(prev_content, list) and isinstance(curr_content, list):
                    result[-1]["content"] = prev_content + curr_content
                elif isinstance(prev_content, str) and isinstance(curr_content, str):
                    result[-1]["content"] = prev_content + "\n" + curr_content
            else:
                result.append(msg)

        return result
