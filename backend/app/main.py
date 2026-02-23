"""
Vestora Backend — FastAPI application entry point.
Sets up CORS, lifespan events (MongoDB connect/disconnect),
and includes all route modules. Images are served via S3 signed URLs.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_db, close_db


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown hooks
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup, disconnect on shutdown."""
    await connect_db()
    yield
    await close_db()


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Vestora API",
    description="AI-powered fashion operating system backend",
    version="0.1.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ---------------------------------------------------------------------------
# Route registration (imported lazily to avoid circular imports)
# ---------------------------------------------------------------------------

from app.routes import (  # noqa: E402
    auth, users, wardrobe, outfits, feedback, suggestions,
    analytics, style_dna, mood, capsule, shopping, social, forecast,
    confidence, notifications,
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(wardrobe.router, prefix="/wardrobe", tags=["Wardrobe"])
app.include_router(outfits.router, prefix="/outfits", tags=["Outfits"])
app.include_router(feedback.router, prefix="/outfits", tags=["Feedback"])
app.include_router(suggestions.router, prefix="/suggestions", tags=["Suggestions"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(style_dna.router, prefix="/style-dna", tags=["Style DNA"])
app.include_router(mood.router, prefix="/mood", tags=["Mood"])
app.include_router(capsule.router, prefix="/capsule", tags=["Capsule"])
app.include_router(shopping.router, prefix="/shopping", tags=["Shopping"])
app.include_router(social.router, prefix="/social", tags=["Social"])
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
app.include_router(confidence.router, prefix="/confidence", tags=["Confidence"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    return {"service": "Vestora API", "version": "0.1.0", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "vestora-api", "version": "0.1.0"}
