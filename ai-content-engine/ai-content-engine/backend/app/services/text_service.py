"""
app/services/text_service.py
Handles all LLM interactions with OpenAI GPT-4o.
Prompts are engineered to return strict JSON for reliable parsing.
"""
from __future__ import annotations
import json
import logging
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)

# Module-level client (key injected from env — never hardcoded)
_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.openai_api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. "
                "Add it to your .env file and never hardcode it."
            )
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


SYSTEM_PROMPT = """You are an expert digital marketing copywriter and SEO specialist.
Your task is to generate platform-optimised marketing content in strict JSON format.
Do NOT include markdown code fences, preamble, or commentary — output raw JSON only.

The JSON schema you must follow:
{
  "blog_post": "string (full blog post, ~400 words, with H2 subheadings marked as **Heading**)",
  "tweets": ["string", "string", "string"],
  "instagram_caption": "string (emoji-rich, ends with 5 relevant hashtags)",
  "newsletter_intro": "string (engaging first paragraph for an email newsletter)",
  "seo_metadata": {
    "title": "string (60 chars max)",
    "meta_description": "string (155 chars max)",
    "keywords": ["string", "string", "string", "string", "string"]
  },
  "image_prompts": ["string", "string"]
}

Only include keys for the requested platforms. Always include seo_metadata and image_prompts.
"""


def generate_campaign_text(
    brief: str,
    platforms: list[str],
    brand_tone: str,
    num_images: int,
) -> dict:
    """
    Call GPT-4o to generate structured marketing content.
    Returns a parsed dict matching GeneratedContent schema.
    """
    client = get_openai_client()

    platform_list = ", ".join(platforms)
    user_prompt = (
        f"Campaign Brief: {brief}\n"
        f"Target Platforms: {platform_list}\n"
        f"Brand Tone: {brand_tone}\n"
        f"Number of promotional images needed: {num_images}\n\n"
        "Generate compelling, conversion-focused content for each requested platform. "
        "Ensure image_prompts are vivid, photorealistic descriptions suitable for DALL-E."
    )

    logger.info("Sending text generation request to GPT-4o | brief=%s", brief[:60])

    response = client.chat.completions.create(
        model=settings.text_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.75,
        response_format={"type": "json_object"},
    )

    raw_json = response.choices[0].message.content
    logger.info("Text generation successful. Tokens used: %s", response.usage.total_tokens)

    return json.loads(raw_json)
