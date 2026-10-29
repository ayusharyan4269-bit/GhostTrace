from typing import Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    log_content: str = Field(..., min_length=1, max_length=200_000, description="Raw terminal session or log content")
    mode: str = Field(
        default="haunted_chronicle",
        description="One of: haunted_chronicle, digital_seance, forensic_detective, lost_memory"
    )
    story_length: str = Field(
        default="balanced",
        description="One of: concise, balanced, epic"
    )
    tone_accent: Optional[str] = Field(None, max_length=100, description="Optional custom subtle atmospheric tone")
    scenario_name: Optional[str] = Field(None, description="Optional name if loaded from a built-in scenario")

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        valid_modes = {"haunted_chronicle", "digital_seance", "forensic_detective", "lost_memory"}
        if v.lower() not in valid_modes:
            raise ValueError(f"Invalid mode '{v}'. Must be one of {valid_modes}")
        return v.lower()

    @field_validator("story_length")
    @classmethod
    def validate_story_length(cls, v: str) -> str:
        valid_lengths = {"concise", "balanced", "epic"}
        if v.lower() not in valid_lengths:
            raise ValueError(f"Invalid length '{v}'. Must be one of {valid_lengths}")
        return v.lower()


class CreateSessionRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    mode: str = Field(...)
    summary: Dict[str, Any] = Field(..., description="Structured summary metrics")
    narrative: Dict[str, Any] = Field(..., description="The complete generated narrative payload")
    notes: Optional[str] = Field(None, max_length=1000)


class UpdateSessionRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)
