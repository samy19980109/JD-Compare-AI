<h1 align="center">🚀 JD-Compare AI</h1>

<p align="center">
  <strong>AI-Powered Job Description Analysis & Comparison Platform</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"></a>
  <a href="https://python.org/"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python" alt="Python"></a>
  <a href="https://postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL"></a>
</p>

<p align="center">
  A modern, full-stack application that leverages cutting-edge AI to help job seekers analyze, compare, and gain insights from multiple job descriptions simultaneously. Built with performance, scalability, and developer experience in mind.
</p>

---

## ✨ Key Features

### 🤖 **Multi-Provider AI Integration**
- **OpenAI GPT-4o** & **Anthropic Claude 3.5** support with seamless switching
- Real-time streaming responses for instant feedback
- Intelligent prompt engineering for contextual job description analysis
- Factory pattern architecture for easy provider extensibility

### 💬 **Interactive AI Chat Interface**
- Tab-based navigation between Job Descriptions and AI Chat
- Streaming markdown responses with syntax highlighting
- Auto-scrolling message history with smooth animations
- Keyboard shortcuts (Ctrl+Enter) for power users

### 📝 **Smart Job Description Management**
- Dynamic card-based JD input with auto-generated labels
- Multi-JD comparison capabilities
- Dark/light mode toggle with persistent preferences
- Responsive design optimized for desktop workflows

### 🗂️ **Workspace Management**
- Create and switch between multiple workspaces
- Persistent JD sets per workspace
- Isolate different job searches or clients

### ⚡ **Performance Optimizations**
- Server-side rendering with Next.js 15 App Router
- State management with Zustand for minimal re-renders
- Tailwind CSS 4.0 for utility-first styling
- Async SQLAlchemy with PostgreSQL for high-performance data layer

---

## 🏗️ Architecture

### **Frontend Stack**
```
Next.js 15 (App Router)     → React 19 + TypeScript 5.7
Tailwind CSS 4.0            → Utility-first styling
Zustand 5                   → Lightweight state management
React Markdown              → Rich content rendering
Lucide React                → Modern iconography
```

### **Backend Stack**
```
FastAPI 0.115               → High-performance Python API
SQLAlchemy 2.0 (Async)      → Type-safe ORM with async support
PostgreSQL 16               → Production-grade database
Alembic                     → Database migrations
OpenAI + Anthropic SDKs     → Multi-LLM provider integration
Pydantic Settings           → Environment-based configuration
```

### **Infrastructure**
```
Docker Compose              → Local development environment
Uvicorn (ASGI)              → Lightning-fast async server
Ruff + MyPy                 → Modern linting and type checking
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/jd-compare-ai.git
cd jd-compare-ai

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
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

---

## 📁 Project Structure

```
jd-compare-ai/
├── frontend/                 # Next.js 15 Application
│   ├── src/
│   │   ├── app/             # App Router pages (layout.tsx, page.tsx)
│   │   ├── components/
│   │   │   ├── chat/        # Chat interface components
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatMessageList.tsx
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   └── StreamingIndicator.tsx
│   │   │   ├── jd/          # Job description components
│   │   │   │   ├── JDCard.tsx
│   │   │   │   ├── JDCardList.tsx
│   │   │   │   ├── JDAddButton.tsx
│   │   │   │   └── JDLabel.tsx
│   │   │   ├── layout/      # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── MainContent.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── workspace/   # Workspace components
│   │   │       └── WorkspaceSelector.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAutoLabel.ts
│   │   │   ├── useAutoSave.ts
│   │   │   └── useChat.ts
│   │   ├── lib/             # API clients & utilities
│   │   │   ├── api.ts
│   │   │   ├── constants.ts
│   │   │   ├── stream.ts
│   │   │   └── workspace.ts
│   │   ├── stores/          # Zustand state stores
│   │   │   ├── chatStore.ts
│   │   │   ├── jdStore.ts
│   │   │   └── themeStore.ts
│   │   └── types/           # TypeScript definitions
│   │       ├── api.ts
│   │       ├── chat.ts
│   │       ├── jd.ts
│   │       └── workspace.ts
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/          # API route handlers
│   │   │   ├── chat.py      # Chat streaming endpoint
│   │   │   ├── jd_sets.py   # JD set management
│   │   │   ├── labels.py    # Label extraction
│   │   │   └── router.py    # API router
│   │   ├── db/              # Database configuration
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/          # SQLAlchemy ORM models
│   │   │   ├── chat_session.py
│   │   │   ├── jd_item.py
│   │   │   ├── jd_set.py
│   │   │   └── user.py
│   │   ├── schemas/         # Pydantic data models
│   │   │   ├── chat.py
│   │   │   ├── jd_set.py
│   │   │   └── label.py
│   │   ├── services/        # Business logic
│   │   │   ├── label_extractor.py
│   │   │   └── llm/         # LLM provider implementations
│   │   │       ├── anthropic_provider.py
│   │   │       ├── base.py
│   │   │       ├── factory.py
│   │   │       ├── openai_provider.py
│   │   │       └── prompt_builder.py
│   │   ├── config.py        # Application configuration
│   │   └── main.py          # Application entry point
│   ├── alembic/             # Database migrations
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   ├── pyproject.toml
│   └── Dockerfile
│
└── docker-compose.yml       # Local development orchestration
```

---

## 🎯 Technical Highlights

### **1. Multi-Provider LLM Architecture**
Implemented a clean factory pattern that abstracts LLM providers, enabling seamless switching between OpenAI and Anthropic without changing business logic:

```python
# Factory pattern for provider switching
from app.services.llm.factory import LLMFactory

provider = LLMFactory.create(settings.provider)
async for token in provider.stream_chat(messages):
    yield token
```

### **2. Streaming Response Architecture**
Built a real-time streaming system using Server-Sent Events (SSE) that delivers AI responses token-by-token for a ChatGPT-like experience.

### **3. Type-Safe Full-Stack**
- **Frontend**: Strict TypeScript with path aliases (`@/components`)
- **Backend**: Pydantic models with SQLAlchemy 2.0 type annotations
- **Shared**: API contracts defined via OpenAPI schema

### **4. Modern State Management**
Zustand stores provide atomic state updates with minimal boilerplate:

```typescript
const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeTab: 'jd',
  // Actions with immer-like updates
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
}));
```

### **5. Developer Experience**
- **Hot reloading** on both frontend and backend
- **Type-safe API client** generated from OpenAPI
- **Dark mode** with CSS variables and Tailwind dark variants
- **Docker Compose** for one-command development setup

---

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat` | POST | Streaming chat completion with SSE |
| `/api/v1/jd-sets` | GET/POST | Manage JD sets |
| `/api/v1/jd-sets/{id}` | GET/PUT/DELETE | Individual JD set operations |
| `/api/v1/labels/extract` | POST | Extract labels from JD text |

View full API documentation at `http://localhost:8000/docs` when running locally.

---

## 🧪 Development

### Code Quality

**Backend:**
```bash
cd backend
ruff check app/          # Linting
mypy app/                # Type checking
```

**Frontend:**
```bash
cd frontend
npm run lint             # ESLint
npm run build            # TypeScript compilation
```

---

## 🛣️ Roadmap

- [ ] **Resume Upload**: PDF parsing and skill extraction
- [ ] **JD Matching**: AI-powered resume-to-JD fit scoring
- [ ] **Collaboration**: Share JD comparisons via unique URLs
- [ ] **Chrome Extension**: One-click JD import from job boards
- [ ] **Export**: PDF/Word report generation
- [ ] **Test Suite**: Comprehensive backend and frontend tests

---

## 📄 License

MIT License - see LICENSE file for details.

---

<p align="center">
  <i>Built with ❤️ using React, FastAPI, and cutting-edge AI</i>
</p>
