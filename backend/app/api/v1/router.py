from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.applications import router as applications_router
from app.api.v1.reminders import router as reminders_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ai import router as ai_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(applications_router)
api_router.include_router(reminders_router)
api_router.include_router(dashboard_router)
api_router.include_router(ai_router)
