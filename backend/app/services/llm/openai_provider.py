import json
from typing import AsyncIterator

from openai import AsyncOpenAI

from app.config import settings
from app.services.llm.base import LLMProvider, PromptParts


class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.chat_model = settings.openai_chat_model
        self.label_model = settings.openai_label_model

    async def stream_chat(self, prompt_parts: PromptParts) -> AsyncIterator[str]:
        # System message = instructions + JD block (stable prefix for auto-caching)
        system_content = (
            prompt_parts.system_instructions + "\n\n" + prompt_parts.jd_block
        )

        messages = [{"role": "system", "content": system_content}]

        for msg in prompt_parts.history:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": prompt_parts.user_message})

        stream = await self.client.chat.completions.create(
            model=self.chat_model,
            messages=messages,
            stream=True,
            max_tokens=4096,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def extract_label(self, jd_text: str) -> dict[str, str | None]:
        truncated = jd_text[:3000]

        response = await self.client.chat.completions.create(
            model=self.label_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract the job title and company name from the following "
                        "job description. Return JSON: {\"title\": \"...\", \"company\": \"...\"}. "
                        "If not found, use null for that field."
                    ),
                },
                {"role": "user", "content": truncated},
            ],
            response_format={"type": "json_object"},
            max_tokens=100,
        )

        content = response.choices[0].message.content
        try:
            parsed = json.loads(content)
            return {
                "title": parsed.get("title"),
                "company": parsed.get("company"),
            }
        except (json.JSONDecodeError, AttributeError):
            return {"title": None, "company": None}
