from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "Bunkered API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: Optional[PostgresDsn] = None
    DATABASE_URL_TEST: str = "sqlite:///./test.db"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str]) -> Any:
        if isinstance(v, str):
            return v
        # Vercel provides a DATABASE_URL environment variable.
        # Use it if it exists, otherwise fall back to the Docker default.
        db_url = os.environ.get("DATABASE_URL")
        if db_url:
            return db_url
        return "postgresql://postgres:postgres@db:5432/bunkered"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Fixed type to match validator output
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
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