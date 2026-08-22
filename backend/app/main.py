"""Main FastAPI application."""

import asyncio
import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db import engine
from app.db.base import Base
from app.services.reminder_service import reminder_service
from app.services.telegram_menu_service import set_bot_commands, setup_mini_app_button
from app.telegram.bot import create_bot

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Global scheduler instance
scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    global scheduler

    # Startup
    # Add settings to app state
    app.state.settings = settings

    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    # Setup Telegram Mini App button
    try:
        bot = create_bot()
        await setup_mini_app_button(bot)
        await set_bot_commands(bot)
        await bot.session.close()
    except Exception as e:
        logger.warning(f"Could not setup Telegram menu: {e}")

    # Start reminder scheduler
    try:
        scheduler = AsyncIOScheduler()

        # Check reminders every minute
        scheduler.add_job(
            reminder_service.check_and_send_reminders,
            'interval',
            minutes=1,
            id='reminder_checker',
            replace_existing=True
        )

        scheduler.start()
        logger.info("✅ Reminder scheduler started (checking every 1 minute)")
        logger.info(f"📋 Scheduled jobs: {scheduler.get_jobs()}")

        # Run immediately once on startup for testing
        logger.info("🔄 Running reminder check immediately on startup...")
        await reminder_service.check_and_send_reminders()
        logger.info("✅ Initial reminder check completed")

    except Exception as e:
        logger.error(f"❌ Could not start scheduler: {e}")
        import traceback
        traceback.print_exc()

    yield

    # Shutdown
    if scheduler:
        scheduler.shutdown()
        logger.info("Reminder scheduler stopped")

    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Telegram Task Reminder Bot with AI-powered date extraction",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Todo Bot - Vazifa Eslatuvchi API",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
