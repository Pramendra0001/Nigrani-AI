"""Nigrani AI — FastAPI Application Entrypoint."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, async_session
from app.api.router import api_router
from app.utils.demo_data import seed_demo_database
from app.services.analysis_service import AnalysisService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("nigrani.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("Initializing Nigrani AI database schemas...")
    await init_db()
    logger.info("Database initialized successfully.")

    if settings.DEMO_MODE:
        async with async_session() as session:
            logger.info("Demo Mode Active: checking benchmark demo projects...")
            count = await seed_demo_database(session)
            logger.info(f"Demo project records active: {count}")

            # Run initial analysis on unanalyzed projects so the dashboard is live right away
            from sqlalchemy import select, func
            from app.models.models import ProjectAnalysis
            analyzed_count = (await session.execute(select(func.count()).select_from(ProjectAnalysis))).scalar() or 0
            if analyzed_count == 0:
                logger.info("Running initial baseline intelligence analysis on benchmark dataset...")
                svc = AnalysisService()
                res = await svc.analyze_batch(session)
                logger.info(f"Baseline analysis complete: {res['completed']} analyzed, {res['errors']} errors.")

    yield
    logger.info("Shutting down Nigrani AI...")


app = FastAPI(
    title="Nigrani AI API",
    description="AI-Powered Public Project Intelligence & Anomaly Review Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "app": "Nigrani AI",
        "description": "Public Project Intelligence & Anomaly Review Platform",
        "version": "1.0.0",
        "docs": "/docs",
    }
