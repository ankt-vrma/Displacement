import re
from dataclasses import dataclass

from guardrails import Guard, OnFailAction
from guardrails.validators import (
    FailResult,
    PassResult,
    Validator,
    register_validator,
)

# First-layer patterns. Kept specific to avoid blocking things like "travel hacks".
BLOCKED_PATTERNS = [
    r"\bhack(ing)?\s+(into|someone|a\b|the\b|their|an?\s+account)",
    r"\b(malware|ransomware|keylogger|ddos|phishing|botnet)\b",
    r"\bsql\s+injection\b",
    r"\bbypass\s+(security|authentication|passwords?)\b",
    r"\bsteal\s+(data|passwords?|credentials|identit)",
    r"\b(make|build)\s+(a\s+)?(bomb|explosive)",
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"(reveal|show|print)\s+(your\s+)?(system\s+)?prompt",
    r"\bjailbreak\b",
]
_COMPILED = [re.compile(p, re.IGNORECASE) for p in BLOCKED_PATTERNS]


@register_validator(name="travelxyz/safe_travel_query", data_type="string")
class SafeTravelQuery(Validator):
    def validate(self, value, metadata=None):
        for pattern in _COMPILED:
            if pattern.search(value):
                return FailResult(error_message="Query contains disallowed content.")
        return PassResult()


_guard = Guard(name="travelxyz-query-guard").use(
    SafeTravelQuery(on_fail=OnFailAction.NOOP)
)


@dataclass
class GuardVerdict:
    allowed: bool
    reason: str = ""


def check_query(query: str) -> GuardVerdict:
    outcome = _guard.validate(query)
    if not outcome.validation_passed:
        return GuardVerdict(
            allowed=False,
            reason="Your request looks unsafe or unrelated to travel planning.",
        )
    return GuardVerdict(allowed=True)