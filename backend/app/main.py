from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .seed import seed_database
from .routers import (
    auth,
    airports,
    travel_requests,
    matching,
    groups,
    quotes,
    notifications,
    analytics,
    flights,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial reference and demo data
    with SessionLocal() as db:
        seed_database(db)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(auth.user_router, prefix=settings.API_V1_STR)
app.include_router(airports.router, prefix=settings.API_V1_STR)
app.include_router(travel_requests.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(groups.router, prefix=settings.API_V1_STR)
app.include_router(quotes.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(flights.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FlyTogether API",
        "disclaimer": "FlyTogether aggregates demand. It does not sell tickets or reserve seats.",
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to FlyTogether API",
        "docs": "/docs",
        "disclaimer": "FlyTogether aggregates demand. It does not sell tickets or reserve seats.",
    }
