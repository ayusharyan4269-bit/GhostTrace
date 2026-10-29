from typing import List, Dict
from collections import Counter
from app.models.events import ParsedEvent, LogSummary


class EventAnalyzer:
    """
    Analyzes extracted events deterministically to identify patterns, metrics,
    and sequence milestones without LLM intervention.
    """

    @classmethod
    def analyze(cls, events: List[ParsedEvent], raw_content: str, fmt: str, notes: List[str]) -> LogSummary:
        lines = [l for l in raw_content.splitlines() if l.strip()]
        total_lines = len(lines)
        extracted_events_count = len(events)

        errors_count = 0
        warnings_count = 0
        commands_count = 0
        timestamps: List[str] = []
        error_messages: List[str] = []
        indicator_counts: Counter = Counter()

        for ev in events:
            if ev.timestamp:
                timestamps.append(ev.timestamp)

            if ev.event_type == "error" or ev.severity in ("high", "critical"):
                errors_count += 1
                msg = ev.normalized_summary.lower()
                if ev.timestamp:
                    ts_low = ev.timestamp.lower()
                    msg = msg.replace(f"[{ts_low}]", "").replace(ts_low, "").strip()
                error_messages.append(msg)
            elif ev.event_type == "warning":
                warnings_count += 1
            elif ev.event_type == "command":
                commands_count += 1

            for ind in ev.indicators:
                indicator_counts[ind] += 1

        # Detect repeated patterns
        patterns: List[str] = []

        # 1. Error frequency
        err_counts = Counter(error_messages)
        for msg, cnt in err_counts.most_common(2):
            if cnt >= 2:
                short_msg = msg[:50] + "..." if len(msg) > 50 else msg
                patterns.append(f"Repeated error: '{short_msg}' occurred {cnt} times")

        # 2. Process lifecycle patterns
        restart_count = indicator_counts.get("process_restart", 0)
        stop_count = indicator_counts.get("process_stop", 0)
        kill_count = indicator_counts.get("process_killed", 0)
        if restart_count >= 2 or (stop_count >= 2 and restart_count >= 1):
            patterns.append(f"Process restart loop: detected {restart_count + stop_count} lifecycle interruptions")
        elif kill_count > 0:
            patterns.append(f"Abrupt termination: {kill_count} signal/kill events recorded")

        # 3. Memory or Fatal crashes
        if indicator_counts.get("memory_fault", 0) > 0:
            patterns.append("Memory fault / segmentation fault detected in log sequence")
        if indicator_counts.get("server_error_5xx", 0) > 0:
            patterns.append(f"Internal server errors (HTTP 5xx): {indicator_counts['server_error_5xx']} instances")

        # 4. Missing files or permissions
        if indicator_counts.get("file_missing", 0) > 0:
            patterns.append(f"Missing resource/ENOENT: {indicator_counts['file_missing']} missing path errors")
        if indicator_counts.get("permission_denied", 0) > 0:
            patterns.append(f"Access restriction: {indicator_counts['permission_denied']} permission/denial events")

        # 5. Command sequence pattern
        if commands_count >= 3:
            patterns.append(f"Developer terminal sequence: {commands_count} sequential operations executed")

        # Determine time range if multiple timestamps exist
        time_range = None
        if timestamps:
            first_ts = timestamps[0]
            last_ts = timestamps[-1]
            if first_ts != last_ts:
                time_range = f"{first_ts} -> {last_ts}"
            else:
                time_range = f"Single timestamp: {first_ts}"

        return LogSummary(
            total_lines=total_lines,
            extracted_events_count=extracted_events_count,
            errors_count=errors_count,
            warnings_count=warnings_count,
            commands_count=commands_count,
            detected_patterns=patterns,
            time_range=time_range,
            format_detected=fmt,
            parsing_notes=notes
        )
