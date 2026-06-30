# Git Commit History Guide — 4-Week Development Roadmap

This document outlines the recommended branching and commit structure for the
AI Content Engine project, satisfying the Infotact evaluation criteria.

---

## Week 1: Multimodal API Integration

**Branch:** `feat/week-1-api-integration`

```
Day 1
  feat: initialise FastAPI project structure and requirements
  feat: add pydantic settings for secure env-based config
  docs: add .env.example with all required variables

Day 2
  feat: implement OpenAI client initialisation with key from env
  feat: add GPT-4o text generation service with structured prompt
  prompt-tuning: update system prompt to enforce strict JSON schema

Day 3
  prompt-tuning: add platform-specific tone guidance to system prompt
  feat: implement DALL-E 3 image generation service
  fix: handle DALL-E rate limit with graceful fallback placeholder

Day 4
  feat: add pydantic schemas for campaign request and response models
  test: add unit tests for text_service JSON parsing

Day 5
  refactor: extract openai client into shared getter function
  feat: add /health endpoint for liveness probes
  docs: document text_service and image_service with docstrings
```

**PR Description:** Establishes core multimodal AI integration. GPT-4o returns
strict JSON via `response_format=json_object`. DALL-E 3 generates promotional
images with consistent style prefix. All API keys injected via env variables.

---

## Week 2: Asynchronous Task Queue Setup

**Branch:** `feat/week-2-celery-queue`

```
Day 1
  feat: add Redis dependency and celery to requirements.txt
  feat: initialise Celery app with Redis broker and result backend
  feat: configure Celery with Asia/Kolkata timezone and JSON serialiser

Day 2
  feat: implement generate_campaign_task as Celery background task
  feat: add POST /api/v1/campaigns endpoint returning task_id immediately
  feat: configure 202 Accepted response for async pattern

Day 3
  feat: implement GET /api/v1/tasks/{task_id} polling endpoint
  feat: map Celery states (PENDING/STARTED/SUCCESS/FAILURE) to API response
  fix: handle unknown Celery states with 500 error response

Day 4
  feat: add DELETE /api/v1/tasks/{task_id} for task cancellation
  feat: add task_track_started=True for granular progress reporting
  test: add integration tests for campaign creation and polling

Day 5
  feat: add docker-compose with Redis, API, and worker services
  feat: add Flower service for task monitoring UI
  docs: document async architecture in README
```

**PR Description:** Implements full Celery + Redis async architecture.
POST /campaigns enqueues immediately; GET /tasks/{id} enables polling.
Frontend never blocks waiting for AI generation.

---

## Week 3: Content Structuring and Parallel Execution

**Branch:** `feat/week-3-parallel-execution`

```
Day 1
  prompt-tuning: restructure system prompt to separate blog/tweets/instagram/newsletter/seo
  feat: add seo_metadata as nested object in JSON schema
  fix: strip potential markdown fences from LLM JSON output

Day 2
  feat: implement ThreadPoolExecutor for parallel text + image generation
  refactor: move parallel execution logic into celery task body
  perf: reduce total generation time by ~50% with concurrent futures

Day 3
  feat: use LLM-generated image_prompts for refined DALL-E requests
  feat: implement graceful fallback to generic prompts if text is slow
  prompt-tuning: add 'photorealistic marketing' style prefix to all image prompts

Day 4
  feat: add progress state updates at 10%/20%/60%/90%/100% milestones
  refactor: improve error handling in celery task with structured logging
  test: add mock tests for parallel execution task

Day 5
  perf: set concurrency=4 on celery worker for throughput
  docs: document parallel execution pattern in README
  refactor: clean up logging format across services
```

**PR Description:** Parallel execution via ThreadPoolExecutor cuts wait time
in half. System prompt now returns fully structured JSON with distinct fields
for each platform. Progress reporting at granular milestones.

---

## Week 4: Dashboard Integration and Final Polish

**Branch:** `feat/week-4-frontend-dashboard`

```
Day 1
  feat: initialise React app with component structure
  feat: add CampaignForm component with platform checkboxes and tone selector
  feat: implement useCampaign hook encapsulating all async state

Day 2
  feat: implement api.js utility with createCampaign and pollUntilComplete
  feat: add ProgressBar component with step labels matching backend milestones
  feat: wire polling interval to useCampaign hook

Day 3
  feat: implement ResultsDashboard with tabbed navigation (6 tabs)
  feat: add tweet character counter with over-limit badge
  feat: add copy-to-clipboard for all text assets

Day 4
  feat: add image grid tab with full-size link and prompt display
  feat: add SEO tab with keyword chips
  feat: style complete dashboard with CSS custom properties

Day 5
  fix: handle CORS preflight in FastAPI middleware
  feat: add frontend Dockerfile and wire into docker-compose
  refactor: final code cleanup and remove debug console.logs
  docs: finalise README with full setup guide and API reference
  chore: ensure .env is in .gitignore and .env.example is complete
```

**PR Description:** Full React dashboard with animated progress bar polling
backend every 2 seconds. Results displayed in 6-tab layout: Blog, Tweets,
Instagram, Newsletter, SEO, Images. Copy-to-clipboard on all content.

---

## Merging to Main

After each week's PR is reviewed and merged:
```
git checkout main
git merge --no-ff feat/week-N-...
git tag v0.N.0 -m "Week N complete"
git push origin main --tags
```

This produces a clean main branch history showing 4 weeks of steady progress.
