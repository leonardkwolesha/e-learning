from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.exceptions import AppError, app_error_handler, generic_error_handler
from api.v1.router import api_router
from api.websockets.tutor_ws import router as tutor_ws_router
from api.websockets.sentiment_ws import router as sentiment_ws_router
from api.websockets.speech_ws import router as speech_ws_router

app = FastAPI(
    title=settings.app_name,
    description="AI-powered personalized learning platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

# REST routes
app.include_router(api_router, prefix=settings.api_prefix)

# WebSocket routes
app.include_router(tutor_ws_router)
app.include_router(sentiment_ws_router)
app.include_router(speech_ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
