from contextlib import asynccontextmanager
import time
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
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
    operations,
)

# In-memory sliding window rate limiter for security-sensitive paths
RATE_LIMIT_BUCKET: dict[str, list[float]] = {}
RATE_LIMIT_MAX_REQUESTS = 30 # requests per minute
RATE_LIMIT_WINDOW = 60.0 # seconds

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

# Security headers middleware
@app.middleware("http")
async def add_security_headers_and_rate_limit(request: Request, call_next):
    # Rate limiting on sensitive authentication endpoints
    if settings.RATE_LIMIT_ENABLED and request.url.path in ["/api/v1/auth/login", "/api/v1/auth/register"]:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = RATE_LIMIT_BUCKET.setdefault(client_ip, [])
        # Expire old requests
        timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        RATE_LIMIT_BUCKET[client_ip] = timestamps

        if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please slow down and try again later."},
                headers={"Retry-After": "60"},
            )
        timestamps.append(now)

    response: Response = await call_next(request)
    # Enforce standard security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

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
app.include_router(operations.router, prefix=settings.API_V1_STR)

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
