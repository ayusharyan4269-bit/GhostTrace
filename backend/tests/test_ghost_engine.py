import pytest
from unittest.mock import AsyncMock, patch
from app.services.log_parser import LogParser
from app.services.event_analyzer import EventAnalyzer
from app.services.ghost_engine import GhostEngine
from app.models.responses import NarrativeResult


@pytest.mark.asyncio
async def test_ghost_engine_structured_generation():
    raw_log = """[02:14:02] INFO Initializing memory map
[02:14:04] ERROR Failed to acquire lockfile /var/lock/spectral.lock
[02:14:05] FATAL worker thread 3 received SIGKILL"""

    events, fmt, notes = LogParser.parse(raw_log)
    summary = EventAnalyzer.analyze(events, raw_log, fmt, notes)

    mock_json_response = """{
        "title": "The Ghost in Thread Three",
        "selected_mode": "haunted_chronicle",
        "opening": "In the quiet dark of the filesystem, memory was claimed.",
        "narrative": "The spectral daemon woke [evt_002] and invented a false trail [evt_999].",
        "key_events": [
            {
                "event_id": "evt_002",
                "title": "Denied Access",
                "log_evidence": "[02:14:04] ERROR Failed to acquire lockfile /var/lock/spectral.lock",
                "line_reference": 2,
                "interpretation": "The lockfile remained untouchable.",
                "is_creative": false
            }
        ],
        "creative_interpretations": [
            {
                "aspect": "The Spectral Lock",
                "factual_basis": "Failed to acquire lockfile /var/lock/spectral.lock",
                "creative_layer": "A seal left behind by a forgotten predecessor"
            }
        ],
        "uncertainties": ["Identity of process holding the lock"],
        "closing_line": "Thread three went silent, leaving only the trace."
    }"""

    engine = GhostEngine()
    with patch("app.services.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = (mock_json_response, {"model": "qwen2.5:3b", "eval_count": 120})
        res, meta = await engine.generate_narrative(events, summary, mode="haunted_chronicle")

        assert isinstance(res, NarrativeResult)
        assert res.title == "The Ghost in Thread Three"
        assert res.selected_mode == "haunted_chronicle"
        assert len(res.key_events) == 1
        assert res.key_events[0].event_id == "evt_002"
        assert res.key_events[0].is_creative is False
        assert res.key_events[0].title == events[1].normalized_summary
        assert res.key_events[0].interpretation == f"Observed in source log: {events[1].normalized_summary}"
        assert "[evt_002]" in res.narrative
        assert "evt_999" not in res.narrative
        assert len(res.creative_interpretations) == 1
        assert "Thread three went silent" in res.closing_line


@pytest.mark.asyncio
async def test_ghost_engine_fallback_on_unstructured_text():
    raw_log = "[10:00:00] ERROR Unknown syntax failure"
    events, fmt, notes = LogParser.parse(raw_log)
    summary = EventAnalyzer.analyze(events, raw_log, fmt, notes)

    unstructured_prose = "Once upon a time in a cold machine, a syntax error appeared like a ghost."

    engine = GhostEngine()
    with patch("app.services.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = (unstructured_prose, {"model": "qwen2.5:3b"})
        res, meta = await engine.generate_narrative(events, summary, mode="digital_seance")

        assert isinstance(res, NarrativeResult)
        assert "Digital Seance" in res.title
        assert len(res.key_events) >= 1
        assert res.narrative == unstructured_prose


def test_anchor_selection_covers_late_events_and_prioritizes_critical_events():
    raw_log = "\n".join([f"INFO ordinary event number {i}" for i in range(40)] + ["CRITICAL late failure"])
    events, _, _ = LogParser.parse(raw_log)
    selected = GhostEngine._select_anchor_events(events, limit=10)
    assert len(selected) == 10
    assert selected[0].event_id == events[0].event_id
    assert selected[-1].event_id == events[-1].event_id
    assert any(event.severity == "critical" for event in selected)
