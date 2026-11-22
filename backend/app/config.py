import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FlyTogether API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "flytogether_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./flytogether.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://flytogether.antideploy.app",
        "http://127.0.0.1:5173",
    ]
    # Notification & Email configuration
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "console")
    SMTP_HOST: str | None = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str | None = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "notifications@flytogether.app")
    # Rate limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    # Duffel production configuration (secrets server-only)
    DUFFEL_ACCESS_TOKEN: str | None = os.getenv("DUFFEL_ACCESS_TOKEN")
    DUFFEL_API_VERSION: str = os.getenv("DUFFEL_API_VERSION", "v2")
    DUFFEL_API_BASE_URL: str = os.getenv("DUFFEL_API_BASE_URL", "https://api.duffel.com")
    DUFFEL_LIVE_ENABLED: bool = os.getenv("DUFFEL_LIVE_ENABLED", "false").lower() == "true"

settings = Settings()
