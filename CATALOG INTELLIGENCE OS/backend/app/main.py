import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, async_session_factory
from app.api import api_router
from app.utils.seed_data import seed_database

logger = logging.getLogger("cios")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if settings.ENVIRONMENT == "development":
        async with async_session_factory() as session:
            record_ids = await seed_database(session)
            if record_ids:
                logger.info(f"Seeded {len(record_ids)} sample source records")

    yield

    await engine.dispose()


app = FastAPI(
    title="Catalog Intelligence OS",
    description="AI-native commerce product data enrichment, classification, quality scoring, and activation platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration:.3f}s)")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None,
        },
    )


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


app.include_router(api_router, prefix="/api/v1")
