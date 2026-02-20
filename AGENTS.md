# AGENTS.md - Development Guidelines for AI Coding Agents

This document provides essential information for AI coding agents working on the JD-Compare AI codebase.

## Project Overview

Full-stack AI-powered job description analysis platform:
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS 4.0, Zustand 5
- **Backend**: FastAPI 0.115, Python 3.11+, SQLAlchemy 2.0 (async), PostgreSQL 16, Alembic
- **AI Providers**: OpenAI GPT-4o, Anthropic Claude 3.5

---

## Build, Lint, and Test Commands

### Backend (Python)

```bash
# Navigate to backend directory first
cd backend

# Install dependencies
pip install -e ".[dev]"

# Run development server
uvicorn app.main:app --reload

# Run all tests with coverage
pytest -v --cov=app

# Run a single test file
pytest tests/test_file.py -v

# Run a single test function
pytest tests/test_file.py::test_function_name -v

# Run tests matching a pattern
pytest -k "pattern" -v

# Linting
ruff check app/

# Type checking
mypy app/

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend (TypeScript/Next.js)

```bash
# Navigate to frontend directory first
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Linting
npm run lint

# Type checking (via build)
npm run build
```

### Docker (Full Stack)

```bash
# Start all services (from project root)
docker-compose up --build

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build backend
docker-compose up --build frontend
```

---

## Code Style Guidelines

### Python (Backend)

**Imports**: Group and sort alphabetically
1. Standard library
2. Third-party packages
3. Local imports

```python
# Standard library
import json
import uuid
from typing import AsyncIterator

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy import select

# Local
from app.config import settings
from app.services.llm.base import LLMProvider
```

**Type Hints**: Always use type hints
```python
# Use modern union syntax
def get_item(id: str) -> dict[str, str] | None:
    ...

# Use Mapped for SQLAlchemy models
from sqlalchemy.orm import Mapped, mapped_column
name: Mapped[str] = mapped_column(String(100), nullable=False)
```

**Naming Conventions**:
- Functions/variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private functions: prefix with `_` (e.g., `_get_or_create_session`)

**Error Handling**:
```python
try:
    result = await risky_operation()
except SpecificError as e:
    # Handle specific error
    logger.error(f"Operation failed: {e}")
    raise
```

**Async Patterns**:
```python
# Always use async/await for async operations
async def fetch_data() -> list[Item]:
    result = await db.execute(select(Item))
    return result.scalars().all()

# Async generators for streaming
async def stream_tokens() -> AsyncIterator[str]:
    async for token in provider.stream():
        yield token
```

**Line Length**: Maximum 100 characters (configured in pyproject.toml)

### TypeScript (Frontend)

**Imports**: Use path aliases, separate type imports
```typescript
// Regular imports
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// Type imports (use `import type`)
import type { ChatMessageUI } from "@/types/chat";
import type { Provider } from "@/types/api";

// Local imports with @ alias
import { useChatStore } from "@/stores/chatStore";
import { API_BASE } from "@/lib/constants";
```

**TypeScript Types**:
```typescript
// Prefer interface for object shapes
export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Use type for unions, primitives
export type Provider = "openai" | "anthropic";

// Always type function parameters and return values
async function fetchData(id: string): Promise<Item | null> {
  // ...
}
```

**Naming Conventions**:
- Components: `PascalCase` (e.g., `ChatPanel`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` or `camelCase` for config objects
- Files: Match component name (e.g., `ChatPanel.tsx`)
- Interfaces: No `I` prefix, just `PascalCase`

**Components**:
```typescript
"use client";

import { useStore } from "@/stores/store";

export function ComponentName() {
  const value = useStore((s) => s.value);

  return (
    <div className="flex flex-col">
      {/* JSX content */}
    </div>
  );
}
```

**State Management (Zustand)**:
```typescript
interface Store {
  items: Item[];
  addItem: (item: Item) => void;
}

export const useStore = create<Store>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
}));
```

**Error Handling**:
```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  // Handle or rethrow
  throw new Error(`Failed to fetch: ${error}`);
}
```

---

## Project Structure

```
resume_helper/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Route handlers
│   │   ├── db/             # Database config
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   │   └── llm/        # LLM provider implementations
│   │   ├── config.py       # Settings
│   │   └── main.py         # FastAPI app entry
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   └── pyproject.toml      # Dependencies
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # API clients, utilities
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript definitions
│   └── package.json
└── docker-compose.yml
```

---

## Key Patterns

### Backend

**LLM Factory Pattern**: Use `get_provider()` to instantiate providers
```python
from app.services.llm.factory import get_provider

provider = get_provider("openai")  # or "anthropic"
async for token in provider.stream_chat(prompt_parts):
    yield token
```

**SSE Streaming**: Server-Sent Events for real-time responses
```python
async def event_generator():
    async for token in provider.stream_chat(prompt_parts):
        yield f"data: {json.dumps({'token': token})}\n\n"

return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Frontend

**Path Aliases**: Use `@/` for src imports
```typescript
import { API_BASE } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";
```

---

## Environment Variables

**Backend (.env)**:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Important Notes

- **No comments** in code unless explicitly requested
- **Strict typing**: Never use `any` in TypeScript, always use type hints in Python
- **Immutability**: Use immutable patterns in React state updates
- **Async-first**: Prefer async/await patterns throughout
- **Modern syntax**: Use `list[Type]` not `List[Type]`, `dict[str, int]` not `Dict[str, int]`
- **Pydantic v2**: Use `BaseModel` from pydantic for schemas
- **SQLAlchemy 2.0**: Use `Mapped[]` and `mapped_column()` for models
