from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging_config import setup_logging, logger
from app.database.connection import init_db
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Configured Ollama runtime at {settings.OLLAMA_BASE_URL} (Model: {settings.OLLAMA_MODEL})")
    await init_db()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Local-first AI engine turning terminal logs into eerie, evidence-grounded narratives.",
    lifespan=lifespan
)

# CORS configuration restricted to local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "Every command leaves a trace. Some traces tell stories.",
        "status": "online",
        "docs_url": "/docs",
        "version": settings.APP_VERSION
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. User input has been preserved."}
    )
