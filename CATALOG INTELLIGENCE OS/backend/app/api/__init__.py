from fastapi import APIRouter

from app.api.ingest import router as ingest_router
from app.api.review import router as review_router
from app.api.products import router as products_router
from app.api.analytics import router as analytics_router
from app.api.taxonomy import router as taxonomy_router
from app.api.export import router as export_router

api_router = APIRouter()
api_router.include_router(ingest_router, prefix="/ingest", tags=["ingest"])
api_router.include_router(review_router, prefix="/review", tags=["review"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(taxonomy_router, prefix="/taxonomy", tags=["taxonomy"])
api_router.include_router(export_router, prefix="/export", tags=["export"])
