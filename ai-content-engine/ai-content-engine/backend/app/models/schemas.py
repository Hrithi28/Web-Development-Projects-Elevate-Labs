"""
app/models/schemas.py
Pydantic models for request/response validation.
"""
from __future__ import annotations
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Platform(str, Enum):
    BLOG = "blog"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    NEWSLETTER = "newsletter"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    STARTED = "STARTED"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


# ── Request Models ────────────────────────────────────────────────────────────

class CampaignRequest(BaseModel):
    brief: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Campaign brief or product description.",
        examples=["Launch campaign for eco-friendly sneakers targeting Gen-Z"],
    )
    platforms: list[Platform] = Field(
        default=[Platform.BLOG, Platform.TWITTER],
        description="Target platforms for content generation.",
    )
    brand_tone: str = Field(
        default="professional yet approachable",
        description="Desired tone of voice for the brand.",
    )
    num_images: int = Field(default=2, ge=1, le=4, description="Number of images to generate.")


# ── Response Models ───────────────────────────────────────────────────────────

class TaskCreatedResponse(BaseModel):
    task_id: str
    message: str = "Campaign generation started. Poll /tasks/{task_id} for status."
    status: TaskStatus = TaskStatus.PENDING


class GeneratedContent(BaseModel):
    blog_post: Optional[str] = None
    tweets: Optional[list[str]] = None
    instagram_caption: Optional[str] = None
    newsletter_intro: Optional[str] = None
    seo_metadata: Optional[dict] = None
    image_urls: Optional[list[str]] = None
    image_prompts: Optional[list[str]] = None


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress: int = Field(default=0, ge=0, le=100, description="Completion percentage.")
    result: Optional[GeneratedContent] = None
    error: Optional[str] = None
