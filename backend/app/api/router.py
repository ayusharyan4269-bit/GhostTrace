from fastapi import APIRouter
from app.api.routes import health, models, analyze, sessions

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(models.router)
api_router.include_router(analyze.router)
api_router.include_router(sessions.router)
