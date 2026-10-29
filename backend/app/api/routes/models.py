from typing import List, Dict, Any
from fastapi import APIRouter
from app.core.config import settings
from app.models.responses import ModelsResponse
from app.services.ollama_client import OllamaClient
from app.scenarios.scenarios import SCENARIOS

router = APIRouter(tags=["Models & Scenarios"])


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    client = OllamaClient()
    connected, _ = await client.check_health()
    detailed_models = await client.list_models() if connected else []

    return ModelsResponse(
        configured_model=settings.OLLAMA_MODEL,
        ollama_connected=connected,
        models=detailed_models
    )


@router.get("/scenarios", response_model=List[Dict[str, Any]])
async def list_scenarios():
    return SCENARIOS
