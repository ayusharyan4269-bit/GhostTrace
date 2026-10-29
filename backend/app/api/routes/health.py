from fastapi import APIRouter
from app.core.config import settings
from app.models.responses import HealthResponse
from app.services.ollama_client import OllamaClient

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def check_health():
    client = OllamaClient()
    connected, models = await client.check_health()
    configured = settings.OLLAMA_MODEL
    # Check if configured model is in available models (matching name or prefix like qwen2.5:3b)
    model_available = any(configured in m or m.startswith(configured) for m in models)

    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        ollama_connected=connected,
        ollama_url=settings.OLLAMA_BASE_URL,
        configured_model=configured,
        model_available=model_available,
        available_models=models
    )
