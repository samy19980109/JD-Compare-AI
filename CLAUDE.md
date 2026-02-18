# JD-Compare AI - Claude Development Guide

This document provides context and guidelines for Claude when working on the JD-Compare AI project.

## Project Overview

**JD-Compare AI** is a full-stack AI-powered job description analysis and comparison platform. It helps job seekers analyze, compare, and gain insights from multiple job descriptions simultaneously using AI (OpenAI GPT-4o and Anthropic Claude 3.5).

## Architecture

### Tech Stack

**Frontend (Next.js 15)**
- Framework: Next.js 15 (App Router)
- Language: TypeScript 5.7
- Styling: Tailwind CSS 4.0
- State: Zustand 5
- UI Components: React 19
- Markdown: react-markdown
- Icons: Lucide React

**Backend (FastAPI)**
- Framework: FastAPI 0.115
- Language: Python 3.11+
- ORM: SQLAlchemy 2.0 (async)
- Database: PostgreSQL 16
- Migrations: Alembic
- AI Providers: OpenAI, Anthropic

**Infrastructure**
- Containerization: Docker Compose
- Server: Uvicorn (ASGI)
- Testing: pytest + pytest-asyncio
- Linting: Ruff + MyPy

## Project Structure

```
resume_helper/
├── frontend/                 # Next.js 15 Application
│   ├── src/
│   │   ├── app/             # App Router pages (page.tsx, layout.tsx)
│   │   ├── components/
│   │   │   ├── chat/        # Chat interface components
│   │   │   ├── jd/          # Job description components
│   │   │   └── layout/      # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients & utilities
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/          # API route handlers
│   │   ├── db/              # Database configuration
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic data models
│   │   ├── services/        # Business logic
│   │   │   ├── llm/         # LLM provider implementations
│   │   │   └── label_extractor.py
│   │   └── main.py          # Application entry point
│   ├── alembic/             # Database migrations
│   ├── tests/               # Test suite
│   ├── pyproject.toml
│   └── Dockerfile
│
├── docker-compose.yml       # Local development orchestration
└── README.md
```

## Development Commands

### Docker (Recommended)
```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Testing & Quality

**Backend:**
```bash
cd backend
pytest -v --cov=app
ruff check app/
mypy app/
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run build
```

## Key Patterns & Conventions

### Frontend Patterns

1. **State Management with Zustand**
   - Use atomic state updates
   - Store files in `src/stores/`
   - Follow existing pattern in `chatStore.ts` and `jdStore.ts`

2. **API Integration**
   - API base URL from `lib/constants.ts`
   - Use `lib/api.ts` for API functions
   - Type-safe responses using `types/api.ts`

3. **Component Structure**
   - Co-locate related components in feature folders
   - Use TypeScript interfaces for props
   - Follow existing naming conventions (PascalCase for components)

### Backend Patterns

1. **LLM Factory Pattern**
   - Located in `app/services/llm/`
   - Abstracts provider switching (OpenAI/Anthropic)
   - Use `get_provider()` to instantiate providers

2. **Streaming Architecture**
   - Server-Sent Events (SSE) for real-time AI responses
   - Event generator pattern in chat endpoints
   - See `app/api/v1/chat.py` for implementation

3. **Database Models**
   - SQLAlchemy 2.0 with async support
   - Models in `app/models/`
   - Schemas in `app/schemas/`
   - Use Alembic for migrations

## Environment Configuration

### Backend (`.env`)
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Important Files

- `frontend/src/lib/constants.ts` - API configuration
- `frontend/src/stores/` - State management
- `backend/app/services/llm/factory.py` - LLM provider factory
- `backend/app/api/v1/chat.py` - Chat streaming endpoint
- `docker-compose.yml` - Development orchestration

## API Endpoints

- `POST /api/v1/chat/stream` - Streaming chat completion
- `POST /api/v1/labels/extract` - Extract labels from JD text

## Coding Guidelines

1. **TypeScript**: Use strict types, avoid `any`
2. **Python**: Follow PEP 8, use type hints
3. **Error Handling**: Use try-catch in async operations
4. **State Updates**: Prefer immutable updates in stores
5. **API Calls**: Always handle loading and error states
6. **Environment Variables**: Never commit .env files

## Common Tasks

### Adding a New LLM Provider
1. Create provider class in `backend/app/services/llm/`
2. Implement `stream_chat()` method
3. Register in factory
4. Update types in frontend

### Adding a New API Endpoint
1. Create router in `backend/app/api/v1/`
2. Define Pydantic schemas
3. Add to main router
4. Create frontend API function in `lib/api.ts`
5. Add types to `types/api.ts`

### Database Changes
1. Modify model in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Apply migration: `alembic upgrade head`

## Documentation Preferences

- Always use Context7 MCP for library/API documentation
- Refer to official docs for FastAPI, Next.js, SQLAlchemy patterns
- Check existing code for style consistency before making changes

## Notes for Claude

- This is a modern full-stack TypeScript/Python project
- Uses cutting-edge versions (Next.js 15, React 19, Tailwind 4.0)
- Focus on type safety and performance
- Prefer async/await patterns throughout
- Always test API endpoints before considering work complete
- Ensure Docker Compose setup remains functional
