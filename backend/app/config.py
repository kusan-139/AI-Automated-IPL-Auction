from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DEV_MODE: bool = True
    
    # Supabase
    SUPABASE_URL: str = "http://localhost:8000/supabase"
    SUPABASE_ANON_KEY: str = "dummy-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "dummy-service-role-key"
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-token-with-at-least-32-characters-long"
    
    # Database
    DB_URL: str = "sqlite+aiosqlite:///./ipl_auction.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

