from fastapi import APIRouter
from .auth import router as auth_router
from .onboarding import router as onboarding_router
from .curriculum import router as curriculum_router
from .content import router as content_router
from .tutor import router as tutor_router
from .assessment import router as assessment_router
from .analytics import router as analytics_router
from .recommendation import router as recommendation_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(onboarding_router)
api_router.include_router(curriculum_router)
api_router.include_router(content_router)
api_router.include_router(tutor_router)
api_router.include_router(assessment_router)
api_router.include_router(analytics_router)
api_router.include_router(recommendation_router)
