import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CaseFlow API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "caseflow-super-secret-key-for-jwt-signing-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "b3JnYW5pemF0aW9uYWwta2V5LTMyLWJ5dGVzLXNlY3JldA==")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./caseflow.db")

    class Config:
        case_sensitive = True

settings = Settings()
