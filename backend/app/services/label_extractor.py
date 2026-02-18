from app.services.llm.factory import get_provider


async def extract_label(text: str, provider: str = "openai") -> dict[str, str | None]:
    llm = get_provider(provider)
    return await llm.extract_label(text)
