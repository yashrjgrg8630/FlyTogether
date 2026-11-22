import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FlyTogether API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
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
    # Duffel production configuration (secrets server-only)
    DUFFEL_ACCESS_TOKEN: str | None = os.getenv("DUFFEL_ACCESS_TOKEN")
    DUFFEL_API_VERSION: str = os.getenv("DUFFEL_API_VERSION", "v2")
    DUFFEL_API_BASE_URL: str = os.getenv("DUFFEL_API_BASE_URL", "https://api.duffel.com")
    DUFFEL_LIVE_ENABLED: bool = os.getenv("DUFFEL_LIVE_ENABLED", "false").lower() == "true"

settings = Settings()
