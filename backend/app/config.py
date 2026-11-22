from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Exports .env into os.environ so LangChain providers find ANTHROPIC_API_KEY etc.
load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Travel XYZ"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    llm_provider: str = "google_genai"
    llm_model: str = "gemini-3.1-flash-lite"

    google_api_key: str = ""
    aviationstack_api_key: str = ""
    tavily_api_key: str = ""
    weatherapi_key: str = ""

    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_bucket: str = "travel-plans"

    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 7


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()