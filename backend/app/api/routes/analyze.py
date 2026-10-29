from fastapi import APIRouter, HTTPException, status
from app.core.config import settings
from app.core.logging_config import logger
from app.models.requests import AnalyzeRequest
from app.models.responses import AnalyzeResponse
from app.services.log_parser import LogParser
from app.services.event_analyzer import EventAnalyzer
from app.services.ghost_engine import GhostEngine
from app.services.secret_redactor import redact_secrets
from app.services.ollama_client import (
    OllamaConnectionError,
    OllamaTimeoutError,
    OllamaModelNotFoundError,
    OllamaError
)

router = APIRouter(tags=["Analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_logs(req: AnalyzeRequest):
    content = req.log_content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Log content cannot be empty."
        )

    if len(content) > settings.MAX_INPUT_CHAR_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Log content exceeds maximum allowed character limit ({settings.MAX_INPUT_CHAR_LIMIT:,} characters)."
        )

    content, redactions_applied = redact_secrets(content)

    # 1. Deterministic log parsing
    events, fmt, notes = LogParser.parse(content)

    # 2. Deterministic event analysis & pattern detection
    summary = EventAnalyzer.analyze(events, content, fmt, notes)

    # 3. Ghost Engine AI Narrative Generation
    engine = GhostEngine()
    narrative = None
    generation_metadata = {}
    error_msg = None

    try:
        narrative, generation_metadata = await engine.generate_narrative(
            events=events,
            summary=summary,
            mode=req.mode,
            length=req.story_length,
            tone_accent=req.tone_accent
        )
    except OllamaConnectionError as e:
        logger.warning(f"Ollama connection error during narrative generation: {e}")
        error_msg = str(e)
    except OllamaModelNotFoundError as e:
        logger.warning(f"Ollama model not found: {e}")
        error_msg = str(e)
    except OllamaTimeoutError as e:
        logger.warning(f"Ollama timeout: {e}")
        error_msg = str(e)
    except OllamaError as e:
        logger.error(f"Ollama inference error: {e}")
        error_msg = str(e)
    except Exception as e:
        logger.error(f"Unexpected error in GhostEngine: {e}", exc_info=True)
        error_msg = f"Narrative generation encountered an unexpected error: {str(e)}"

    return AnalyzeResponse(
        success=(narrative is not None),
        summary=summary,
        events=events,
        narrative=narrative,
        generation_metadata=generation_metadata,
        error=error_msg,
        redactions_applied=redactions_applied,
    )
