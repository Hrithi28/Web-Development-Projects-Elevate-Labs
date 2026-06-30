# ⚡ AI Content Marketing Engine
### Infotact Internship Program — Project 3: Media & Entertainment

> **One campaign brief → blog post, tweets, Instagram caption, newsletter intro, SEO metadata, and AI-generated promotional images — all in ~20 seconds.**

---

## Architecture Overview

```
User (React)
    │
    │  POST /api/v1/campaigns  (returns task_id immediately)
    ▼
FastAPI (uvicorn)
    │
    │  enqueue → Redis message broker
    ▼
Celery Worker
    ├── Thread 1: GPT-4o → structured JSON (text + image prompts)
    └── Thread 2: DALL-E 3 → image URLs
    │
    │  store result in Redis
    ▼
FastAPI  ←── GET /api/v1/tasks/{task_id}  ←── React (polling every 2s)
```

**Key design decisions:**
- FastAPI returns a `task_id` **immediately** (202 Accepted) — no timeout risk
- Text and image generation run **in parallel** via `ThreadPoolExecutor` — ~50% faster
- All AI API keys injected via `.env` — never hardcoded (CI security hygiene)
- Results stored in Redis for 1 hour (configurable)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend API | Python 3.12 + FastAPI | Async-native, auto OpenAPI docs |
| Task Queue | Celery 5 + Redis 7 | Industry-standard async job processing |
| Text AI | OpenAI GPT-4o | Best-in-class structured JSON output |
| Image AI | OpenAI DALL-E 3 | Highest quality, unified API key |
| Frontend | React 18 | Component model ideal for tabbed dashboard |
| Containerisation | Docker + docker-compose | Reproducible local environment |
| Task Monitor | Celery Flower | Real-time worker visibility |

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Docker Desktop installed
- An OpenAI API key (`sk-...`)

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd ai-content-engine
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your OpenAI key:
```
OPENAI_API_KEY=sk-your-real-key-here
```

### 2. Start all services

```bash
docker-compose up --build
```

This starts:
- **Redis** on port 6379
- **FastAPI** on http://localhost:8000
- **Celery worker** (background)
- **Flower** task monitor on http://localhost:5555
- **React frontend** on http://localhost:3000

### 3. Open the app

Navigate to **http://localhost:3000** and enter a campaign brief!

---

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # fill in OPENAI_API_KEY

# Terminal 1 — Start Redis (requires Redis installed locally)
redis-server

# Terminal 2 — Start FastAPI
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Start Celery worker
celery -A app.tasks.celery_app.celery_app worker --loglevel=info

# Terminal 4 (optional) — Flower monitor
celery -A app.tasks.celery_app.celery_app flower
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## API Reference

### `POST /api/v1/campaigns`
Submit a campaign brief for async generation.

**Request body:**
```json
{
  "brief": "Launch campaign for eco-friendly sneakers targeting Gen-Z",
  "platforms": ["blog", "twitter", "instagram"],
  "brand_tone": "playful and eco-conscious",
  "num_images": 2
}
```

**Response (202 Accepted):**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "message": "Campaign generation started. Poll /tasks/{task_id} for status."
}
```

---

### `GET /api/v1/tasks/{task_id}`
Poll for task completion.

**Response (in progress):**
```json
{
  "task_id": "550e8400...",
  "status": "STARTED",
  "progress": 60
}
```

**Response (complete):**
```json
{
  "task_id": "550e8400...",
  "status": "SUCCESS",
  "progress": 100,
  "result": {
    "blog_post": "...",
    "tweets": ["...", "...", "..."],
    "instagram_caption": "...",
    "newsletter_intro": "...",
    "seo_metadata": {
      "title": "...",
      "meta_description": "...",
      "keywords": ["...", "..."]
    },
    "image_urls": ["https://...", "https://..."],
    "image_prompts": ["...", "..."]
  }
}
```

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

---

## Git Workflow (Internship Standards)

This project follows semantic commit conventions:

```bash
feat: add campaign generation endpoint
fix: handle DALL-E rate limit gracefully
prompt-tuning: updated system prompt to output strict JSON format
refactor: extract image service into dedicated module
docs: add API reference to README
test: add unit tests for task status polling
```

Branching strategy:
- `main` — production-ready code only
- `feat/week-1-api-integration`
- `feat/week-2-celery-queue`
- `feat/week-3-parallel-execution`
- `feat/week-4-frontend-dashboard`

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | — | Your OpenAI API key |
| `REDIS_URL` | No | `redis://localhost:6379/0` | Redis connection URL |
| `TEXT_MODEL` | No | `gpt-4o` | OpenAI text model |
| `IMAGE_MODEL` | No | `dall-e-3` | OpenAI image model |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |

---

## Project Structure

```
ai-content-engine/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── campaigns.py       # FastAPI routes
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic models
│   │   ├── services/
│   │   │   ├── text_service.py    # GPT-4o integration
│   │   │   └── image_service.py   # DALL-E 3 integration
│   │   ├── tasks/
│   │   │   └── celery_app.py      # Celery task + parallel execution
│   │   ├── config.py              # Env-based settings
│   │   └── main.py                # FastAPI app
│   ├── tests/
│   │   └── test_campaigns.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CampaignForm.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ResultsDashboard.jsx
│   │   ├── hooks/
│   │   │   └── useCampaign.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── App.css
│   └── Dockerfile
└── docker-compose.yml
```

---

## Security Checklist

- [x] API keys loaded from `.env` only — never hardcoded
- [x] `.env` listed in `.gitignore`
- [x] CORS restricted to configured origins
- [x] Input validation via Pydantic (length limits, enum validation)
- [x] No sensitive data in logs
