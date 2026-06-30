"""
app/services/image_service.py
Handles image generation via OpenAI DALL-E 3.
"""
from __future__ import annotations
import logging
from openai import OpenAI
from app.config import settings
from app.services.text_service import get_openai_client

logger = logging.getLogger(__name__)


def generate_images(prompts: list[str]) -> list[str]:
    """
    Generate images for each prompt using DALL-E 3.
    Returns a list of image URLs (valid for 60 minutes).

    Args:
        prompts: List of descriptive prompts for image generation.

    Returns:
        List of URLs pointing to generated images.
    """
    client = get_openai_client()
    image_urls: list[str] = []

    for i, prompt in enumerate(prompts):
        logger.info("Generating image %d/%d | prompt=%s...", i + 1, len(prompts), prompt[:60])

        # Prepend style prefix for consistent brand aesthetic
        styled_prompt = (
            "High-quality professional marketing photograph, "
            "clean white background, vibrant colors, photorealistic: "
            + prompt
        )

        try:
            response = client.images.generate(
                model=settings.image_model,
                prompt=styled_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            url = response.data[0].url
            image_urls.append(url)
            logger.info("Image %d generated successfully.", i + 1)
        except Exception as exc:
            logger.error("Image generation failed for prompt %d: %s", i + 1, exc)
            # Append a placeholder so indices stay consistent
            image_urls.append(
                f"https://placehold.co/1024x1024/e2e8f0/64748b?text=Image+{i+1}+Unavailable"
            )

    return image_urls
