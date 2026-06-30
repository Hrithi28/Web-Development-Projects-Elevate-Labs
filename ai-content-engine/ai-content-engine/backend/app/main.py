"""
app/main.py
FastAPI application entry point.
"""
from __future__ import annotations
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.campaigns import router as campaign_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Content Marketing Engine",
    description=(
        "Multi-Modal AI Content Engine — generates platform-optimised copy, "
        "SEO metadata, and promotional images from a single campaign brief."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the React dev server (and any configured origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(campaign_router)


@app.get("/health", tags=["health"])
async def health_check():
    """Simple liveness probe."""
    return {"status": "ok", "env": settings.app_env}


@app.on_event("startup")
async def startup_event():
    logger.info("AI Content Engine starting up in %s mode", settings.app_env)
