"""
app/api/campaigns.py
Campaign generation endpoints.

POST /campaigns      → enqueue task, return task_id immediately
GET  /tasks/{id}     → poll task status and retrieve results
"""
from __future__ import annotations
import logging
from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult

from app.models.schemas import (
    CampaignRequest,
    TaskCreatedResponse,
    TaskStatusResponse,
    TaskStatus,
    GeneratedContent,
)
from app.tasks.celery_app import celery_app, generate_campaign_task

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["campaigns"])


@router.post("/campaigns", response_model=TaskCreatedResponse, status_code=202)
async def create_campaign(payload: CampaignRequest):
    """
    Accept a campaign brief and kick off async AI generation.

    Returns immediately with a `task_id` for polling.
    """
    logger.info("Received campaign request: %s", payload.brief[:60])

    task = generate_campaign_task.delay(
        brief=payload.brief,
        platforms=[p.value for p in payload.platforms],
        brand_tone=payload.brand_tone,
        num_images=payload.num_images,
    )

    logger.info("Enqueued task_id=%s", task.id)
    return TaskCreatedResponse(task_id=task.id)


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Poll this endpoint with the task_id to check generation progress.
    Returns status + result once complete.
    """
    result: AsyncResult = celery_app.AsyncResult(task_id)

    if result.state == "PENDING":
        return TaskStatusResponse(task_id=task_id, status=TaskStatus.PENDING, progress=0)

    if result.state == "STARTED":
        meta = result.info or {}
        return TaskStatusResponse(
            task_id=task_id,
            status=TaskStatus.STARTED,
            progress=meta.get("progress", 10),
        )

    if result.state == "SUCCESS":
        data = result.result or {}
        return TaskStatusResponse(
            task_id=task_id,
            status=TaskStatus.SUCCESS,
            progress=100,
            result=GeneratedContent(**data),
        )

    if result.state == "FAILURE":
        error_msg = str(result.info) if result.info else "Unknown error"
        return TaskStatusResponse(
            task_id=task_id,
            status=TaskStatus.FAILURE,
            progress=0,
            error=error_msg,
        )

    raise HTTPException(status_code=500, detail=f"Unknown task state: {result.state}")


@router.delete("/tasks/{task_id}", status_code=204)
async def cancel_task(task_id: str):
    """Revoke a pending or running task."""
    celery_app.control.revoke(task_id, terminate=True)
    logger.info("Revoked task_id=%s", task_id)
