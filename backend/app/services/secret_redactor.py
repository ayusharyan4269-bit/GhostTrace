"""Best-effort redaction for common credentials found in pasted logs."""
import re
from typing import Tuple

_PATTERNS = [
    (re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", re.I), "[REDACTED PRIVATE KEY]"),
    (re.compile(r"\b(authorization\s*:\s*)(?:bearer|basic)\s+[^\s,;]+", re.I), r"\1[REDACTED]"),
    (re.compile(r"\b(((?:[A-Za-z0-9]+[_-])*)(?:api[_-]?key|access[_-]?key|client[_-]?secret|secret|password|passwd|token)\s*[=:]\s*)(?!\[REDACTED\])(?:\"[^\"]*\"|'[^']*'|[^\s,;\"']+)", re.I), r"\1[REDACTED]"),
    (re.compile(r"\b(?:sk-ant-[A-Za-z0-9_-]{12,}|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})\b"), "[REDACTED CREDENTIAL]"),
    (re.compile(r"\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b"), "[REDACTED JWT]"),
    (re.compile(r"([A-Za-z][A-Za-z0-9+.-]*://)[^\s/:@]+:[^\s/@]+@", re.I), r"\1[REDACTED]@"),
]


def redact_secrets(content: str) -> Tuple[str, int]:
    """Return redacted content and the number of detected credential matches."""
    count = 0
    for pattern, replacement in _PATTERNS:
        content, matches = pattern.subn(replacement, content)
        count += matches
    return content, count
