from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.events import ParsedEvent, LogSummary


class KeyNarrativeEvent(BaseModel):
    event_id: str = Field(..., description="Matches one of the extracted parsed event IDs")
    title: str = Field(..., description="Short dramatic or forensic title of the event")
    log_evidence: str = Field(..., description="Exact or verbatim snippet from the source log")
    line_reference: Optional[int] = Field(None, description="Source line number if known")
    interpretation: str = Field(..., description="Narrative commentary or explanation")
    is_creative: bool = Field(default=False, description="True if creative fiction, False if factual deduction")


class CreativeInterpretation(BaseModel):
    aspect: str = Field(..., description="Theme, entity, or motif in the story")
    factual_basis: str = Field(..., description="What the log actually said")
    creative_layer: str = Field(..., description="How the narrative reimagined it for mood/theme")


class NarrativeResult(BaseModel):
    title: str = Field(..., description="Haunting, cinematic or forensic title")
    selected_mode: str = Field(..., description="haunted_chronicle, digital_seance, forensic_detective, lost_memory")
    opening: str = Field(..., description="Atmospheric prologue / cold open")
    narrative: str = Field(..., description="The complete rich narrative story")
    key_events: List[KeyNarrativeEvent] = Field(default_factory=list, description="Grounding anchors to real events")
    creative_interpretations: List[CreativeInterpretation] = Field(
        default_factory=list,
        description="Explicit breakdown of where the AI added poetic or creative license"
    )
    uncertainties: List[str] = Field(default_factory=list, description="Things the logs leave unresolved")
    closing_line: str = Field(..., description="Memorable final chilling or insightful line")


class AnalyzeResponse(BaseModel):
    success: bool = True
    summary: LogSummary
    events: List[ParsedEvent]
    narrative: Optional[NarrativeResult] = None
    generation_metadata: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    redactions_applied: int = 0


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    ollama_connected: bool
    ollama_url: str
    configured_model: str
    model_available: bool
    available_models: List[str] = Field(default_factory=list)


class ModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    modified_at: Optional[str] = None
    parameter_size: Optional[str] = None


class ModelsResponse(BaseModel):
    configured_model: str
    ollama_connected: bool
    models: List[ModelInfo] = Field(default_factory=list)


class SessionItem(BaseModel):
    session_id: str
    title: str
    mode: str
    created_at: str
    updated_at: str
    events_count: int
    errors_count: int
    notes: Optional[str] = None


class SessionDetailResponse(BaseModel):
    session_id: str
    title: str
    mode: str
    created_at: str
    updated_at: str
    summary: Dict[str, Any]
    narrative: Dict[str, Any]
    notes: Optional[str] = None
