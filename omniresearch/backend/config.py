from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    brave_search_api_key: str = ""
    tavily_api_key: str = ""
    youtube_data_api_key: str = ""
    news_api_key: str = ""
    listen_notes_api_key: str = ""
    github_token: str = ""
    huggingface_token: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    groq_api_key: str = ""
    redis_url: str = "redis://localhost:6379/0"
    chromadb_url: str = "http://localhost:8001"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
