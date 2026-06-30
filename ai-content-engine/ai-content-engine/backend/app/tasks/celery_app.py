"""
app/tasks/celery_app.py
Celery application configuration and campaign generation task.

Architecture:
  - FastAPI immediately returns a task_id
  - This Celery worker picks up the job from Redis
  - Text + image generation run in PARALLEL using concurrent.futures
  - Frontend polls /tasks/{task_id} until status == SUCCESS
"""
from __future__ import annotations
import logging
import concurrent.futures
from celery import Celery
from app.config import settings

logger = logging.getLogger(__name__)

# Initialise Celery with Redis as both broker and result backend
celery_app = Celery(
    "ai_content_engine",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    result_expires=3600,  # Results kept in Redis for 1 hour
)


@celery_app.task(bind=True, name="tasks.generate_campaign")
def generate_campaign_task(
    self,
    brief: str,
    platforms: list[str],
    brand_tone: str,
    num_images: int,
) -> dict:
    """
    Background task: orchestrates parallel text + image generation.

    Workflow:
      1. Update state → STARTED (0%)
      2. Kick off text_service and image_service concurrently
      3. Merge results
      4. Return structured payload (stored in Redis by Celery)
    """
    # Lazy import inside task to avoid circular imports
    from app.services.text_service import generate_campaign_text
    from app.services.image_service import generate_images

    try:
        logger.info("[Task %s] Starting campaign generation for brief: %s", self.request.id, brief[:60])

        # ── Step 1: Update progress ───────────────────────────────────────────
        self.update_state(state="STARTED", meta={"progress": 10, "step": "Initialising AI models"})

        # ── Step 2: Parallel execution ────────────────────────────────────────
        # We spin up two threads: one for text, one for images.
        # This cuts total wait time roughly in half.
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            self.update_state(
                state="STARTED",
                meta={"progress": 20, "step": "Generating copy and images in parallel"},
            )

            future_text = executor.submit(
                generate_campaign_text,
                brief,
                platforms,
                brand_tone,
                num_images,
            )

            # We'll derive image prompts from the text result first if text finishes fast,
            # otherwise we generate a generic set immediately for true parallelism.
            generic_image_prompts = [
                f"Professional marketing image for: {brief}" for _ in range(num_images)
            ]
            future_images = executor.submit(generate_images, generic_image_prompts)

            # Collect text result
            text_result = future_text.result()
            logger.info("[Task %s] Text generation complete.", self.request.id)
            self.update_state(state="STARTED", meta={"progress": 60, "step": "Text ready, awaiting images"})

            # If DALL-E prompts came back with the text, regenerate images with better prompts
            refined_prompts = text_result.get("image_prompts", generic_image_prompts)[:num_images]

            # Cancel generic image future if still running and resubmit with refined prompts
            if not future_images.done():
                future_images.cancel()
                future_images = executor.submit(generate_images, refined_prompts)

            image_urls = future_images.result()
            logger.info("[Task %s] Image generation complete.", self.request.id)

        self.update_state(state="STARTED", meta={"progress": 90, "step": "Assembling final assets"})

        # ── Step 3: Merge & return ────────────────────────────────────────────
        result = {
            "blog_post": text_result.get("blog_post"),
            "tweets": text_result.get("tweets", []),
            "instagram_caption": text_result.get("instagram_caption"),
            "newsletter_intro": text_result.get("newsletter_intro"),
            "seo_metadata": text_result.get("seo_metadata", {}),
            "image_urls": image_urls,
            "image_prompts": refined_prompts,
        }

        logger.info("[Task %s] Campaign generation SUCCESS.", self.request.id)
        return result

    except Exception as exc:
        logger.exception("[Task %s] Campaign generation FAILED: %s", self.request.id, exc)
        self.update_state(state="FAILURE", meta={"progress": 0, "error": str(exc)})
        raise exc
