import pytest
from app.services.log_parser import LogParser


def test_parse_plain_text_with_timestamps_and_errors():
    raw_log = """[2026-10-28 02:14:02] INFO Starting daemon
[2026-10-28 02:14:04] ERROR Permission denied for /var/lock
$ kill -9 4102
[2026-10-28 02:14:05] FATAL Process terminated with SIGKILL"""

    events, fmt, notes = LogParser.parse(raw_log)
    assert fmt == "plain_text"
    assert len(events) == 4

    assert events[0].timestamp == "2026-10-28 02:14:02"
    assert events[0].event_type == "process"

    assert events[1].event_type == "error"
    assert "error_detected" in events[1].indicators
    assert events[1].severity in ("high", "critical")

    assert events[2].event_type == "command"
    assert events[2].timestamp is None  # no timestamp invented!

    assert events[3].event_type == "error"
    assert events[3].severity == "critical"
    assert "fatal_error" in events[3].indicators or "process_killed" in events[3].indicators


def test_parse_json_logs():
    json_data = """[
        {"time": "2026-10-28T01:00:00Z", "level": "info", "msg": "Server listening on :8080"},
        {"time": "2026-10-28T01:05:00Z", "level": "error", "msg": "Database connection refused"}
    ]"""
    events, fmt, notes = LogParser.parse(json_data)
    assert fmt == "json"
    assert len(events) == 2
    assert events[0].timestamp == "2026-10-28T01:00:00Z"
    assert events[1].event_type == "error"


def test_parse_ndjson_logs():
    ndjson = """{"timestamp": "2026-10-28T01:00:00Z", "message": "worker spawned"}
{"timestamp": "2026-10-28T01:02:00Z", "message": "worker crashed with SIGSEGV"}"""
    events, fmt, notes = LogParser.parse(ndjson)
    assert fmt == "json"
    assert len(events) == 2
    assert events[1].severity == "critical"


def test_parse_csv_logs():
    csv_data = """timestamp,level,message
2026-10-28 00:01:00,INFO,Worker initialized
2026-10-28 00:02:00,WARN,High memory usage
2026-10-28 00:03:00,ERROR,Out of memory"""
    events, fmt, notes = LogParser.parse(csv_data)
    assert fmt == "csv"
    assert len(events) == 3
    assert events[0].timestamp == "2026-10-28 00:01:00"
    assert events[1].event_type == "warning"
    assert events[2].event_type == "error"


def test_malformed_json_fallback():
    malformed = """{"time": "2026-10-28", "msg": "broken json without closing brace"""
    events, fmt, notes = LogParser.parse(malformed)
    # Should fallback gracefully to plain text without crashing!
    assert len(events) == 1
    assert len(notes) > 0 or fmt == "plain_text"


def test_missing_timestamp_never_fabricated():
    log = "npm install express\nError: Cannot find module 'react'"
    events, fmt, _ = LogParser.parse(log)
    assert len(events) == 2
    assert events[0].timestamp is None
    assert events[1].timestamp is None
