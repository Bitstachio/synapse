import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from models.user_story_verdict import UserStoryVerdict

logger = logging.getLogger(__name__)

_DEFAULT_OPENAI_MODEL: str = "gpt-4o-mini"
_RISK_UNSAFE_THRESHOLD: float = 0.5


def _resolve_prototype_json_path() -> Path:
    """
    Prefer env FRAMEWORK_PROTOTYPE_JSON, then brain/active-framework-response.json,
    then committed brain/fixtures/active-framework-response.json (used on Render).
    """
    env_path: str = os.environ.get("FRAMEWORK_PROTOTYPE_JSON", "").strip()
    if env_path:
        p = Path(env_path)
        if p.is_file():
            return p
    brain_root: Path = Path(__file__).resolve().parent.parent
    for candidate in (
        brain_root / "active-framework-response.json",
        brain_root / "fixtures" / "active-framework-response.json",
    ):
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        "No prototype framework JSON found. Set FRAMEWORK_PROTOTYPE_JSON or add "
        "brain/fixtures/active-framework-response.json (or brain/active-framework-response.json)."
    )


class _RiskScoreSchema(BaseModel):
    """
    Strict schema that the OpenAI model MUST emit via Structured Outputs.
    Extend here (and in the prompt) when you later want more fields in the JSON.
    """

    risk_score: float = Field(..., ge=0.0, le=1.0)


class NLPService:
    """
    Loads the active framework (`active-framework-response.json`, same shape as
    GET /frameworks/active) and delegates risk scoring to OpenAI (ChatGPT).

    The model decides its own scoring method; we only constrain the output shape
    via Structured Outputs so `risk_score` is always a float in [0.0, 1.0].
    """

    def __init__(self) -> None:
        self._model: str = os.environ.get("OPENAI_MODEL", _DEFAULT_OPENAI_MODEL)
        self._client: Optional[AsyncOpenAI] = None

    def _get_client(self) -> AsyncOpenAI:
        """Lazy-initialized OpenAI client so app startup does not require the key."""
        if self._client is None:
            api_key: str = os.environ.get("OPENAI_API_KEY", "").strip()
            if not api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY is not set. Add it to brain/.env or the environment."
                )
            self._client = AsyncOpenAI(api_key=api_key)
        return self._client

    def _load_prototype_framework(self) -> tuple[dict[str, Any], Optional[str]]:
        path: Path = _resolve_prototype_json_path()
        with open(path, encoding="utf-8") as f:
            payload: Any = json.load(f)
        data: Any = payload.get("data") if isinstance(payload, dict) else None
        if not isinstance(data, dict):
            raise ValueError("Invalid JSON: expected top-level 'data' object")
        content: Any = data.get("content")
        if not isinstance(content, dict):
            raise ValueError("Invalid JSON: expected data.content object")
        raw_id: Any = data.get("_id")
        framework_id: Optional[str] = str(raw_id) if raw_id is not None else None
        return content, framework_id

    @staticmethod
    def generate_audit_context(framework: dict[str, Any]) -> str:
        """Flattens the hierarchical framework JSON into a text block for the LLM prompt."""
        lines: list[str] = ["EXAMINE THE USER STORY AGAINST THESE SYNAPSE CONTROLS:"]
        for cat in framework.get("categories", []):
            for sub in cat.get("subcategories", []):
                for instr in sub.get("instructions", []):
                    iid: str = str(instr.get("id", "?"))
                    desc: str = str(instr.get("description", ""))
                    risk: str = str(instr.get("risk_level", "n/a"))
                    lines.append(f"- [{iid}] {desc} (Risk: {risk})")
        return "\n".join(lines)

    def _build_system_prompt(self, framework_context: str) -> str:
        return (
            "You are Synapse, a governance risk analyzer.\n"
            "Evaluate the provided user story against the governance framework below and "
            "return a single numeric risk_score between 0.0 (no risk) and 1.0 (critical risk).\n"
            "You may use any internal reasoning or scoring method you prefer; only the final "
            "risk_score is returned.\n\n"
            f"{framework_context}"
        )

    async def _score_with_openai(
        self,
        story_text: str,
        framework_context: str,
    ) -> float:
        client: AsyncOpenAI = self._get_client()
        completion = await client.beta.chat.completions.parse(
            model=self._model,
            messages=[
                {
                    "role": "system",
                    "content": self._build_system_prompt(framework_context),
                },
                {"role": "user", "content": f"USER STORY:\n{story_text}"},
            ],
            response_format=_RiskScoreSchema,
        )
        parsed: Optional[_RiskScoreSchema] = completion.choices[0].message.parsed
        if parsed is None:
            raise ValueError("OpenAI returned no parsed structured output.")
        # Clamp defensively in case of edge-case float drift.
        return max(0.0, min(1.0, float(parsed.risk_score)))

    async def analyze_story(self, text: str) -> UserStoryVerdict:
        try:
            framework_content, framework_id = self._load_prototype_framework()
        except (OSError, ValueError, json.JSONDecodeError) as e:
            return UserStoryVerdict(
                is_safe=False,
                risk_score=1.0,
                violated_controls=[],
                remediation=f"Could not load framework JSON: {e}",
                framework_id=None,
            )

        framework_context: str = self.generate_audit_context(framework_content)

        try:
            risk_score: float = await self._score_with_openai(text, framework_context)
        except Exception as e:
            logger.exception("OpenAI risk scoring failed")
            return UserStoryVerdict(
                is_safe=False,
                risk_score=1.0,
                violated_controls=[],
                remediation=f"OpenAI risk scoring failed: {e}",
                framework_id=framework_id,
            )

        is_safe: bool = risk_score < _RISK_UNSAFE_THRESHOLD
        return UserStoryVerdict(
            is_safe=is_safe,
            risk_score=risk_score,
            violated_controls=[],
            remediation=(
                "Risk score computed by OpenAI against the active framework. "
                f"is_safe is derived from risk_score < {_RISK_UNSAFE_THRESHOLD}."
            ),
            framework_id=framework_id,
        )
