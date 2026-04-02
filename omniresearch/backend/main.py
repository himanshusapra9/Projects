from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import export, research, sources
from config import settings

app = FastAPI(
    title="OmniResearch API",
    version="1.0.0",
    description="Universal Open-Source Multi-Source Intelligence Agent",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research.router, prefix="/api/v1", tags=["research"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])
app.include_router(sources.router, prefix="/api/v1", tags=["sources"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
