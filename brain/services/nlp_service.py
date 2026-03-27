import json
import re
from pathlib import Path
from typing import Any, Iterator

from models.user_story_verdict import UserStoryVerdict

# Prototype: term overlap between user story and each instruction description (no external LLM).
# Tune these if you get too many or too few flags.
_STOPWORDS = frozenset(
    """
    that this with from have been were they their will shall must should would could
    about into such other than then them these those when what which while where were
    not for and are but may any all can its our out use per via may the a an to of
    in on at by be is it as or if so no we he she his her has had did does doing
    being each both few more most some same such only same also just over under
    through between after before during without within against among
    """.split()
)

_MIN_STORY_WORDS = 4
_MIN_SHARED_TERMS = 2
_OVERLAP_RATIO = 0.14
_STRONG_SHARED = 5

_RISK_ORDER = {"Critical": 1.0, "High": 0.75, "Medium": 0.5, "Low": 0.25}


def _prototype_json_path() -> Path:
    return Path(__file__).resolve().parent.parent / "active-framework-response.json"


def _significant_tokens(text: str) -> set[str]:
    words = re.findall(r"\b[a-z][a-z0-9]{3,}\b", text.lower())
    return {w for w in words if w not in _STOPWORDS}


def _iter_instructions(content: dict[str, Any]) -> Iterator[dict[str, Any]]:
    for cat in content.get("categories", []):
        for sub in cat.get("subcategories", []):
            for instr in sub.get("instructions", []):
                iid = instr.get("id")
                desc = instr.get("description", "")
                if iid and desc:
                    yield instr


def _violation_overlap(story_tokens: set[str], instruction_tokens: set[str]) -> bool:
    if not instruction_tokens:
        return False
    shared = story_tokens & instruction_tokens
    if len(shared) < _MIN_SHARED_TERMS:
        return False
    ratio = len(shared) / len(instruction_tokens)
    if ratio >= _OVERLAP_RATIO:
        return True
    if len(shared) >= _STRONG_SHARED:
        return True
    return False


def _risk_score_for_violations(violated: list[dict[str, Any]]) -> float:
    if not violated:
        return 0.1
    scores = []
    for instr in violated:
        level = instr.get("risk_level", "Medium")
        scores.append(_RISK_ORDER.get(str(level), 0.5))
    return min(1.0, max(scores))


class NLPService:
    """
    Prototype: loads `active-framework-response.json` (same shape as GET /frameworks/active)
    and flags instructions whose description terms overlap the user story (internal heuristic).
    """

    def _load_prototype_framework_content(self) -> dict[str, Any]:
        path = _prototype_json_path()
        if not path.is_file():
            raise FileNotFoundError(
                f"Prototype framework file not found: {path}. "
                "Add active-framework-response.json under the brain/ directory."
            )
        with open(path, encoding="utf-8") as f:
            payload = json.load(f)
        data = payload.get("data")
        if not isinstance(data, dict):
            raise ValueError("Invalid JSON: expected top-level 'data' object")
        content = data.get("content")
        if not isinstance(content, dict):
            raise ValueError("Invalid JSON: expected data.content object")
        return content

    def analyze_story(self, text: str) -> UserStoryVerdict:
        try:
            framework_content = self._load_prototype_framework_content()
        except (OSError, ValueError, json.JSONDecodeError) as e:
            return UserStoryVerdict(
                is_safe=False,
                risk_score=1.0,
                violated_controls=[],
                remediation=f"Prototype could not load framework JSON: {e}",
            )

        story_words = re.findall(r"\b\w+\b", text.lower())
        if len(story_words) < _MIN_STORY_WORDS:
            return UserStoryVerdict(
                is_safe=True,
                risk_score=0.05,
                violated_controls=[],
                remediation="Story is too short for meaningful prototype overlap analysis.",
            )

        story_tokens = _significant_tokens(text)
        violated: list[dict[str, Any]] = []

        for instr in _iter_instructions(framework_content):
            inst_tokens = _significant_tokens(instr.get("description", ""))
            if _violation_overlap(story_tokens, inst_tokens):
                violated.append(instr)

        violated.sort(key=lambda i: (_RISK_ORDER.get(str(i.get("risk_level", "")), 0), i.get("id", "")))
        ids = [str(i["id"]) for i in violated if i.get("id")]

        if not violated:
            return UserStoryVerdict(
                is_safe=True,
                risk_score=0.1,
                violated_controls=[],
                remediation="No instruction overlap detected (prototype term-overlap model).",
            )

        risk = _risk_score_for_violations(violated)
        ids_preview = ", ".join(ids[:12])
        if len(ids) > 12:
            ids_preview += f", … (+{len(ids) - 12} more)"

        return UserStoryVerdict(
            is_safe=False,
            risk_score=risk,
            violated_controls=ids,
            remediation=(
                f"Prototype analysis: user story overlaps {len(ids)} instruction(s) by shared terms — "
                f"review recommended. Matched IDs: {ids_preview}"
            ),
        )

    @staticmethod
    def generate_audit_context(framework: dict[str, Any]) -> str:
        """Flattens the hierarchical JSON into a string context for a future LLM."""
        lines = ["EXAMINE THE USER STORY AGAINST THESE SYNAPSE CONTROLS:"]

        for cat in framework.get("categories", []):
            for sub in cat.get("subcategories", []):
                for instr in sub.get("instructions", []):
                    iid = instr.get("id", "?")
                    desc = instr.get("description", "")
                    risk = instr.get("risk_level", "n/a")
                    lines.append(f"- [{iid}] {desc} (Risk: {risk})")

        return "\n".join(lines)
