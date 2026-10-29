from typing import Optional, List
from pydantic import BaseModel, Field


class ParsedEvent(BaseModel):
    event_id: str = Field(..., description="Unique event identifier e.g. evt_001")
    line_number: int = Field(..., description="1-indexed line number in source input")
    timestamp: Optional[str] = Field(None, description="Deterministic timestamp if present, null if absent")
    event_type: str = Field(..., description="command, error, warning, process, network, file_io, info")
    raw_text: str = Field(..., description="Original log line or raw event snippet")
    normalized_summary: str = Field(..., description="Clean deterministic summary of the action/event")
    indicators: List[str] = Field(default_factory=list, description="Keywords or signals detected deterministically")
    severity: str = Field(default="low", description="low, medium, high, critical")


class LogSummary(BaseModel):
    total_lines: int
    extracted_events_count: int
    errors_count: int
    warnings_count: int
    commands_count: int
    detected_patterns: List[str] = Field(default_factory=list)
    time_range: Optional[str] = None
    format_detected: str = "plain_text"
    parsing_notes: List[str] = Field(default_factory=list)
