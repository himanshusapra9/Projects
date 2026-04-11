from __future__ import annotations

import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = os.environ.get("GROQ_API_KEY", "gsk_placeholder_set_your_key")
    groq_max_rpm: int = 25
    groq_primary_model: str = "llama-3.3-70b-versatile"
    groq_fallback_model: str = "llama3-8b-8192"
    groq_cache_ttl: int = 300
    sse_heartbeat_interval: int = 15
    ws_ping_interval: int = 30
    max_sse_clients: int = 100
    cohort_window_months: int = 3
    rfm_score_buckets: int = 5
    arrival_forecast_days: int = 7
    max_customers_per_groq_batch: int = 10

    model_config = {"env_file": ".env", "extra": "ignore"}


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
