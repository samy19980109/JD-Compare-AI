from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # LLM Providers
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Models
    openai_chat_model: str = "gpt-4o"
    openai_label_model: str = "gpt-4o-mini"
    anthropic_chat_model: str = "claude-sonnet-4-20250514"
    anthropic_label_model: str = "claude-haiku-4-5-20251001"

    # Database
    database_url: str = "postgresql+asyncpg://jdcompare:localdev@localhost:5432/jdcompare"

    # Auth
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
