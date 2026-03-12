from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    gemini_api_key: str
    gemini_model: str = 'gemini-1.5-flash'
    deepseek_api_key: str = ''
    secret_key: str
    cors_origins: str = 'http://localhost:19006'
    redis_url: str
    redis_token: str = ''
    stripe_key: str = ''
    stripe_webhook_secret: str = ''
    app_url: str = 'http://localhost:8000'

    class Config:
        env_file = '.env'

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
