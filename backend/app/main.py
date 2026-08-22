"""Main FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db import engine
from app.db.base import Base
from app.services.telegram_menu_service import set_bot_commands, setup_mini_app_button
from app.telegram.bot import create_bot

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
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
        print(f"Warning: Could not setup Telegram menu: {e}")

    yield

    # Shutdown
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
