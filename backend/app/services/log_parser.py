import re
import json
import csv
import io
from typing import List, Tuple, Optional
from app.models.events import ParsedEvent

# Precompiled regex patterns for deterministic matching
TIMESTAMP_PATTERNS = [
    # ISO 8601: 2026-10-28T02:14:05.123Z or 2026-10-28 02:14:05
    re.compile(r"\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b"),
    # Syslog format: Oct 28 02:14:05 or Oct  4 02:14:05
    re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b"),
    # Bracketed time: [02:14:05] or [02:14:05.123]
    re.compile(r"\[(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]"),
    # Standard time: 02:14:05 or 02:14:05.123
    re.compile(r"\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b"),
]

COMMAND_PREFIX_PATTERNS = [
    re.compile(r"^(?:\$|#|>|PS [A-Z]:\\[^>]*>|[\w.-]+@[\w.-]+:[^$#]*[$#])\s*(.+)"),
]

KNOWN_COMMAND_STARTS = (
    "git ", "npm ", "node ", "pnpm ", "yarn ", "docker ", "docker-compose ",
    "kubectl ", "systemctl ", "service ", "python ", "python3 ", "cargo ",
    "go ", "curl ", "wget ", "ssh ", "scp ", "cat ", "grep ", "rm ", "kill ",
    "chmod ", "chown ", "sudo ", "cd ", "ls ", "mv ", "cp ", "make ", "sh ", "bash "
)

ERROR_KEYWORDS = [
    (re.compile(r"\b(FATAL|CRITICAL|PANIC)\b", re.IGNORECASE), "fatal_error", "critical"),
    (re.compile(r"\b(SEGMENTATION FAULT|SIGSEGV|SIGBUS|SIGABRT)\b", re.IGNORECASE), "memory_fault", "critical"),
    (re.compile(r"\b(SIGKILL|KILLED BY SIGNAL|OOMKilled|OUT OF MEMORY)\b", re.IGNORECASE), "process_killed", "critical"),
    (re.compile(r"\b(ERROR|FAIL(?:ED|URE)?|EXCEPTION|TRACEBACK|ERRNO)\b", re.IGNORECASE), "error_detected", "high"),
    (re.compile(r"\bEXIT(?:ED WITH)? CODE [1-9]\d*\b", re.IGNORECASE), "non_zero_exit", "high"),
    (re.compile(r"\b(HTTP\s+)?50[0-4]\b"), "server_error_5xx", "high"),
    (re.compile(r"\b(PERMISSION DENIED|EACCES|UNAUTHORIZED|ACCESS DENIED)\b", re.IGNORECASE), "permission_denied", "high"),
    (re.compile(r"\b(FILE NOT FOUND|NO SUCH FILE|ENOENT)\b", re.IGNORECASE), "file_missing", "medium"),
    (re.compile(r"\b(CONNECTION REFUSED|ECONNREFUSED|TIMEOUT|TIMED OUT)\b", re.IGNORECASE), "network_failure", "medium"),
]

WARN_KEYWORDS = [
    (re.compile(r"\b(WARN(?:ING)?|DEPRECAT(?:ED|ION)|CAUTION)\b", re.IGNORECASE), "warning_detected", "medium"),
    (re.compile(r"\b(HTTP\s+)?40[1-4]\b"), "client_error_4xx", "medium"),
    (re.compile(r"\bRETRY(?:ING|)?\b", re.IGNORECASE), "retry_action", "low"),
]

PROCESS_KEYWORDS = [
    (re.compile(r"\b(STARTING|STARTED|INITIALIZING|SPAWNED|LAUNCHED)\b", re.IGNORECASE), "process_start"),
    (re.compile(r"\b(STOPPING|STOPPED|TERMINATED|EXITING|SHUTDOWN)\b", re.IGNORECASE), "process_stop"),
    (re.compile(r"\b(RESTARTING|RESTARTED|REBOOT)\b", re.IGNORECASE), "process_restart"),
]


class LogParser:
    """
    Deterministic log parser that extracts structured events without LLM hallucination.
    """

    @staticmethod
    def detect_format(content: str) -> str:
        trimmed = content.strip()
        if not trimmed:
            return "plain_text"

        # Check for JSON Array or Object
        if (trimmed.startswith("{") and trimmed.endswith("}")) or (trimmed.startswith("[") and trimmed.endswith("]")):
            try:
                json.loads(trimmed)
                return "json"
            except Exception:
                pass

        # Check for NDJSON (newline-delimited JSON)
        first_lines = [line.strip() for line in trimmed.splitlines() if line.strip()][:5]
        if first_lines and all(l.startswith("{") and l.endswith("}") for l in first_lines):
            try:
                for l in first_lines:
                    json.loads(l)
                return "json"
            except Exception:
                pass

        # Check for CSV (must have multiple commas per line and consistent column counts)
        if len(first_lines) >= 2:
            try:
                sniffer = csv.Sniffer()
                sample = "\n".join(first_lines)
                dialect = sniffer.sniff(sample)
                if dialect.delimiter in (",", ";", "\t"):
                    return "csv"
            except Exception:
                pass

        return "plain_text"

    @classmethod
    def parse(cls, content: str) -> Tuple[List[ParsedEvent], str, List[str]]:
        """
        Parses raw string content into deterministic ParsedEvents.
        Returns (events, format_detected, parsing_notes).
        """
        fmt = cls.detect_format(content)
        notes = []

        if fmt == "json":
            try:
                events = cls._parse_json(content)
                if events:
                    return events, "json", notes
            except Exception as e:
                notes.append(f"JSON parsing encountered irregularities; fell back to line parser: {str(e)}")

        elif fmt == "csv":
            try:
                events = cls._parse_csv(content)
                if events:
                    return events, "csv", notes
            except Exception as e:
                notes.append(f"CSV parsing encountered irregularities; fell back to line parser: {str(e)}")

        # Fallback / Default: Line-by-line deterministic parser
        events = cls._parse_plain_text(content)
        return events, "plain_text", notes

    @classmethod
    def _parse_plain_text(cls, content: str) -> List[ParsedEvent]:
        events: List[ParsedEvent] = []
        lines = content.splitlines()
        evt_idx = 1

        for line_num, line in enumerate(lines, start=1):
            stripped = line.strip()
            if not stripped:
                continue

            event_id = f"evt_{evt_idx:03d}"
            timestamp = cls._extract_timestamp(stripped)
            event_type, indicators, severity = cls._classify_line(stripped)
            summary = cls._generate_line_summary(stripped, event_type)

            # We create an event if it contains a meaningful indicator, command, or timestamp
            # Otherwise, we still retain informative events to avoid losing context.
            events.append(
                ParsedEvent(
                    event_id=event_id,
                    line_number=line_num,
                    timestamp=timestamp,
                    event_type=event_type,
                    raw_text=stripped,
                    normalized_summary=summary,
                    indicators=indicators,
                    severity=severity
                )
            )
            evt_idx += 1

        return events

    @classmethod
    def _parse_json(cls, content: str) -> List[ParsedEvent]:
        events: List[ParsedEvent] = []
        trimmed = content.strip()
        data = None

        # First try full payload parse
        try:
            parsed = json.loads(trimmed)
            if isinstance(parsed, dict):
                if "logs" in parsed and isinstance(parsed["logs"], list):
                    data = parsed["logs"]
                elif "events" in parsed and isinstance(parsed["events"], list):
                    data = parsed["events"]
                else:
                    data = [parsed]
            elif isinstance(parsed, list):
                data = parsed
        except Exception:
            # Parse line-by-line NDJSON
            data = []
            for line in trimmed.splitlines():
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    obj = json.loads(line_str)
                    if isinstance(obj, dict):
                        data.append(obj)
                except Exception:
                    continue

        if not data:
            return events

        for idx, item in enumerate(data, start=1):
            if not isinstance(item, dict):
                continue
            event_id = f"evt_{idx:03d}"
            # Extract timestamp
            timestamp = str(item.get("timestamp") or item.get("time") or item.get("date") or item.get("@timestamp") or "")
            if not timestamp:
                timestamp = cls._extract_timestamp(json.dumps(item))

            # Extract message
            message = str(item.get("message") or item.get("msg") or item.get("log") or item.get("event") or json.dumps(item))
            level = str(item.get("level") or item.get("severity") or "").lower()

            event_type, indicators, severity = cls._classify_line(message)
            if "err" in level or "fatal" in level:
                severity = "critical" if "fatal" in level else "high"
                event_type = "error"
                if "error_detected" not in indicators:
                    indicators.append("error_detected")
            elif "warn" in level:
                severity = "medium"
                event_type = "warning"
                if "warning_detected" not in indicators:
                    indicators.append("warning_detected")

            events.append(
                ParsedEvent(
                    event_id=event_id,
                    line_number=idx,
                    timestamp=timestamp if timestamp else None,
                    event_type=event_type,
                    raw_text=json.dumps(item),
                    normalized_summary=message[:140],
                    indicators=indicators,
                    severity=severity
                )
            )

        return events

    @classmethod
    def _parse_csv(cls, content: str) -> List[ParsedEvent]:
        events: List[ParsedEvent] = []
        reader = csv.reader(io.StringIO(content.strip()))
        rows = list(reader)
        if not rows:
            return events

        # Check headers
        header = [col.strip().lower() for col in rows[0]]
        has_header = any(h in ["timestamp", "time", "date", "level", "message", "event", "severity"] for h in header)

        data_rows = rows[1:] if has_header else rows
        ts_col = None
        msg_col = None
        lvl_col = None

        if has_header:
            for idx, col in enumerate(header):
                if col in ["timestamp", "time", "date"]:
                    ts_col = idx
                elif col in ["message", "msg", "log", "event", "command"]:
                    msg_col = idx
                elif col in ["level", "severity"]:
                    lvl_col = idx

        for idx, row in enumerate(data_rows, start=2 if has_header else 1):
            if not row or not any(row):
                continue
            event_id = f"evt_{len(events) + 1:03d}"
            raw_line = ",".join(row)

            timestamp = row[ts_col].strip() if ts_col is not None and len(row) > ts_col else cls._extract_timestamp(raw_line)
            msg = row[msg_col].strip() if msg_col is not None and len(row) > msg_col else raw_line

            event_type, indicators, severity = cls._classify_line(msg)
            if lvl_col is not None and len(row) > lvl_col:
                lvl = row[lvl_col].strip().lower()
                if "err" in lvl:
                    event_type = "error"
                    severity = "high"
                elif "warn" in lvl:
                    event_type = "warning"
                    severity = "medium"

            events.append(
                ParsedEvent(
                    event_id=event_id,
                    line_number=idx,
                    timestamp=timestamp if timestamp else None,
                    event_type=event_type,
                    raw_text=raw_line,
                    normalized_summary=msg[:140],
                    indicators=indicators,
                    severity=severity
                )
            )

        return events

    @classmethod
    def _extract_timestamp(cls, text: str) -> Optional[str]:
        for pat in TIMESTAMP_PATTERNS:
            match = pat.search(text)
            if match:
                # If matched a group like [02:14:05], return the group
                if match.groups():
                    return match.group(1)
                return match.group(0)
        return None

    @classmethod
    def _classify_line(cls, line: str) -> Tuple[str, List[str], str]:
        indicators: List[str] = []
        severity = "low"
        event_type = "info"

        # Check command prompt patterns
        is_cmd = False
        for pat in COMMAND_PREFIX_PATTERNS:
            match = pat.match(line)
            if match:
                is_cmd = True
                event_type = "command"
                indicators.append("command_execution")
                break

        if not is_cmd:
            stripped_lower = line.strip().lower()
            if any(stripped_lower.startswith(cmd) for cmd in KNOWN_COMMAND_STARTS):
                event_type = "command"
                indicators.append("command_execution")

        # Check errors
        for pat, tag, sev in ERROR_KEYWORDS:
            if pat.search(line):
                event_type = "error"
                if tag not in indicators:
                    indicators.append(tag)
                if sev == "critical":
                    severity = "critical"
                elif severity != "critical":
                    severity = "high"

        # Check warnings if not error
        if event_type != "error":
            for pat, tag, sev in WARN_KEYWORDS:
                if pat.search(line):
                    event_type = "warning"
                    if tag not in indicators:
                        indicators.append(tag)
                    if severity == "low":
                        severity = sev

        # Check process lifecycle
        for pat, tag in PROCESS_KEYWORDS:
            if pat.search(line):
                if tag not in indicators:
                    indicators.append(tag)
                if event_type not in ("error", "warning"):
                    event_type = "process"

        return event_type, indicators, severity

    @classmethod
    def _generate_line_summary(cls, line: str, event_type: str) -> str:
        # Strip long noisy traces, keep key prefix
        line_clean = " ".join(line.split())
        if len(line_clean) > 130:
            return line_clean[:127] + "..."
        return line_clean
