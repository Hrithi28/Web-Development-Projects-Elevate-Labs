"""
tests/test_campaigns.py
Unit and integration tests for the campaign API.
Run with: pytest tests/ -v
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ── Health check ──────────────────────────────────────────────────────────────

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ── Campaign creation ─────────────────────────────────────────────────────────

@patch("app.api.campaigns.generate_campaign_task")
def test_create_campaign_returns_task_id(mock_task):
    """POST /api/v1/campaigns should enqueue a task and return 202 + task_id."""
    mock_result = MagicMock()
    mock_result.id = "test-task-uuid-1234"
    mock_task.delay.return_value = mock_result

    payload = {
        "brief": "Launch campaign for eco-friendly sneakers targeting Gen-Z",
        "platforms": ["blog", "twitter"],
        "brand_tone": "playful and eco-conscious",
        "num_images": 2,
    }
    response = client.post("/api/v1/campaigns", json=payload)

    assert response.status_code == 202
    data = response.json()
    assert "task_id" in data
    assert data["task_id"] == "test-task-uuid-1234"
    assert data["status"] == "PENDING"


def test_create_campaign_validation_error():
    """Brief shorter than 10 chars should fail validation."""
    response = client.post("/api/v1/campaigns", json={"brief": "short"})
    assert response.status_code == 422


# ── Task status polling ───────────────────────────────────────────────────────

@patch("app.api.campaigns.celery_app")
def test_get_task_status_pending(mock_celery):
    mock_result = MagicMock()
    mock_result.state = "PENDING"
    mock_celery.AsyncResult.return_value = mock_result

    response = client.get("/api/v1/tasks/fake-task-id")
    assert response.status_code == 200
    assert response.json()["status"] == "PENDING"


@patch("app.api.campaigns.celery_app")
def test_get_task_status_success(mock_celery):
    mock_result = MagicMock()
    mock_result.state = "SUCCESS"
    mock_result.result = {
        "blog_post": "Sample blog post content here.",
        "tweets": ["Tweet 1", "Tweet 2", "Tweet 3"],
        "instagram_caption": "Sample caption #eco",
        "newsletter_intro": "Welcome to our newsletter!",
        "seo_metadata": {"title": "Eco Sneakers", "meta_description": "desc", "keywords": []},
        "image_urls": ["https://example.com/img1.png"],
        "image_prompts": ["A sneaker on grass"],
    }
    mock_celery.AsyncResult.return_value = mock_result

    response = client.get("/api/v1/tasks/fake-task-id")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["progress"] == 100
    assert data["result"]["tweets"] is not None
