from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from collections import deque

from cachetools import TTLCache

logger = logging.getLogger("pulseai.groq")


class GroqClient:
    """Singleton Groq LLM client with rate limiting, caching, and model fallback."""

    _instance: GroqClient | None = None

    def __new__(cls) -> GroqClient:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True

        from backend.config import settings

        self._api_key = settings.groq_api_key
        self._primary_model = settings.groq_primary_model
        self._fallback_model = settings.groq_fallback_model
        self._max_rpm = settings.groq_max_rpm
        self._cache = TTLCache(maxsize=500, ttl=settings.groq_cache_ttl)

        self._request_timestamps: dict[str, deque] = {
            self._primary_model: deque(),
            self._fallback_model: deque(),
        }

        self._client = None
        self._available = False
        self._init_client()

    def _init_client(self) -> None:
        if not self._api_key or self._api_key.startswith("gsk_placeholder"):
            logger.warning(
                "GROQ_API_KEY not set — Groq analysis disabled, using heuristic fallback"
            )
            return
        try:
            from groq import AsyncGroq

            self._client = AsyncGroq(api_key=self._api_key)
            self._available = True
            logger.info("Groq client initialized (primary: %s)", self._primary_model)
        except Exception as exc:
            logger.warning("Failed to init Groq client: %s", exc)

    @property
    def available(self) -> bool:
        return self._available

    def _check_rate_limit(self, model: str) -> bool:
        now = time.monotonic()
        timestamps = self._request_timestamps.setdefault(model, deque())
        while timestamps and now - timestamps[0] > 60:
            timestamps.popleft()
        return len(timestamps) < self._max_rpm

    def _record_request(self, model: str) -> None:
        self._request_timestamps.setdefault(model, deque()).append(time.monotonic())

    def _cache_key(self, model: str, prompt: str, system: str) -> str:
        h = hashlib.sha256(f"{model}:{system}:{prompt}".encode()).hexdigest()[:32]
        return h

    async def analyze(
        self,
        prompt: str,
        system: str,
        max_tokens: int = 1024,
        temperature: float = 0.1,
    ) -> str:
        if not self._available:
            raise RuntimeError("Groq client not available")

        cache_key = self._cache_key(self._primary_model, prompt, system)
        if cache_key in self._cache:
            return self._cache[cache_key]

        for model in [self._primary_model, self._fallback_model]:
            if not self._check_rate_limit(model):
                logger.warning("Rate limit reached for %s, trying next model", model)
                continue

            try:
                self._record_request(model)
                response = await self._client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                result = response.choices[0].message.content or ""
                self._cache[cache_key] = result
                return result

            except Exception as exc:
                exc_str = str(exc)
                if "429" in exc_str or "rate" in exc_str.lower():
                    logger.warning("Rate limited on %s: %s", model, exc_str[:120])
                    continue
                logger.error("Groq API error on %s: %s", model, exc_str[:200])
                raise

        await asyncio.sleep(2)
        if self._check_rate_limit(self._fallback_model):
            self._record_request(self._fallback_model)
            response = await self._client.chat.completions.create(
                model=self._fallback_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
            )
            result = response.choices[0].message.content or ""
            self._cache[cache_key] = result
            return result

        raise RuntimeError("All Groq models rate-limited; retry later")

    async def analyze_batch(self, items: list[str], system: str) -> list[str]:
        results = []
        for item in items:
            result = await self.analyze(prompt=item, system=system)
            results.append(result)
            await asyncio.sleep(0.1)
        return results
