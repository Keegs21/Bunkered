from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Bunkered API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/bunkered"
    DATABASE_URL_TEST: str = "sqlite:///./test.db"

    @field_validator("DATABASE_URL")
    @classmethod
    def fix_postgres_scheme(cls, v: str) -> str:
        """Ensure the database URL uses the 'postgresql' scheme."""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000"]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle comma-separated string from environment variables
            return [i.strip() for i in v.split(',')]
        return []
    
    # External APIs
    DATAGOLF_API_KEY: Optional[str] = None
    ODDS_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    
    # DataGolf API Configuration
    DATAGOLF_BASE_URL: str = "https://feeds.datagolf.com"
    
    # The Odds API Configuration
    ODDS_API_BASE_URL: str = "https://api.the-odds-api.com/v4"
    
    # News API Configuration
    NEWS_API_BASE_URL: str = "https://newsapi.org/v2"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # This allows extra fields to be ignored


settings = Settings() 