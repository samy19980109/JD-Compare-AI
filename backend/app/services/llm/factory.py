from app.services.llm.base import LLMProvider
from app.services.llm.openai_provider import OpenAIProvider
from app.services.llm.anthropic_provider import AnthropicProvider

_providers: dict[str, LLMProvider] = {}


def get_provider(name: str = "openai") -> LLMProvider:
    if name not in _providers:
        if name == "openai":
            _providers[name] = OpenAIProvider()
        elif name == "anthropic":
            _providers[name] = AnthropicProvider()
        else:
            raise ValueError(f"Unknown provider: {name}")
    return _providers[name]
