import pytest
from app.services.log_parser import LogParser
from app.services.event_analyzer import EventAnalyzer


def test_event_analyzer_metrics_and_patterns():
    raw_content = """[10:00:00] INFO Starting app
[10:01:00] ERROR Connection to Redis timed out
[10:02:00] ERROR Connection to Redis timed out
[10:03:00] WARN Memory threshold exceeded
$ restart app
[10:04:00] FATAL Killed process with SIGKILL"""

    events, fmt, notes = LogParser.parse(raw_content)
    summary = EventAnalyzer.analyze(events, raw_content, fmt, notes)

    assert summary.total_lines == 6
    assert summary.extracted_events_count == 6
    assert summary.errors_count >= 2
    assert summary.warnings_count >= 1
    assert summary.commands_count >= 1
    assert summary.time_range == "10:00:00 -> 10:04:00"

    # Pattern detection
    pattern_text = " ".join(summary.detected_patterns).lower()
    assert "repeated error" in pattern_text
    assert "redis timed out" in pattern_text or "kill" in pattern_text


def test_event_analyzer_no_timestamps():
    raw_content = "command_one\ncommand_two\ncommand_three"
    events, fmt, notes = LogParser.parse(raw_content)
    summary = EventAnalyzer.analyze(events, raw_content, fmt, notes)

    assert summary.time_range is None
    assert summary.commands_count == 0  # not prefixed or known keyword
    assert summary.extracted_events_count == 3
