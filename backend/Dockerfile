FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app

COPY pyproject.toml .

# Install dependencies only (not the package itself)
RUN pip install uv && \
    uv pip install --system \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.34.0" \
    "openai>=1.60.0" \
    "anthropic>=0.42.0" \
    "pydantic-settings>=2.7.0" \
    "sqlalchemy[asyncio]>=2.0.36" \
    "asyncpg>=0.30.0" \
    "alembic>=1.14.0" \
    "python-jose[cryptography]>=3.3.0" \
    "passlib[bcrypt]>=1.7.4" \
    "httpx>=0.28.0"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
