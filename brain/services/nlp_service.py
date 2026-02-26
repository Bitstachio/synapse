import logging
from typing import Any, Optional

import httpx

from models.user_story_verdict import UserStoryVerdict

# Setup basic logging to see when the framework updates
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NLPService:
    """
    Service responsible for auditing user stories against the Synapse Wellbeing Framework.
    Now dynamically fetches the active policy from the NestJS Governance API.
    """

    def __init__(self, api_base_url: str = "http://localhost:3000") -> None:
        self.api_url = f"{api_base_url}/api/v1/frameworks/active"
        self.framework: Optional[dict[str, Any]] = None
        # We don't 'await' in __init__, so we'll call load_framework separately or on first use

    async def load_framework(self) -> None:
        """Fetches the currently active framework from the NestJS API."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.api_url, timeout=5.0)
                response.raise_for_status()
                data = response.json().get("data")

                self.framework = data.get("content")
                logger.info(
                    f"Synapse Brain synced with: {data.get('name')} (v{data.get('version')})"
                )
            except Exception as e:
                logger.error(f"Failed to fetch framework from API: {e}")
                # TODO: Load a local backup if the API is unreachable (optional)
                self.framework = None

    def generate_audit_context(self) -> str:
        """Flattens the hierarchical API JSON into a string context for the LLM."""
        if not self.framework:
            return "WARNING: NO ACTIVE GOVERNANCE FRAMEWORK LOADED."

        lines = ["EXAMINE THE USER STORY AGAINST THESE SYNAPSE CONTROLS:"]

        # Note the change from 'self.framework["functions"]' to navigating the API JSON
        for fn in self.framework.get("functions", []):
            for cat in fn.get("categories", []):
                for sub in cat.get("subcategories", []):
                    lines.append(
                        f"- [{sub['id']}] {sub['description']} (Risk: {sub['risk_level']})"
                    )
        return "\n".join(lines)

    async def analyze_story(self, text: str) -> UserStoryVerdict:
        """Analyzes user story text using the dynamically loaded framework."""
        if not self.framework:
            await self.load_framework()

        # TODO: Integrate with LLM (e.g., OpenAI/Gemini) using generate_audit_context()

        # Prototype logic: Trigger violation for monitoring/tracking keywords
        if any(word in text.lower() for word in ["monitor", "track", "keystroke"]):
            return UserStoryVerdict(
                is_safe=False,
                risk_score=0.9,
                violated_controls=["PR.SM1", "PR.AU2"],
                remediation="User story involves invasive monitoring without transparency.",
            )

        return UserStoryVerdict(
            is_safe=True,
            risk_score=0.1,
            violated_controls=[],
            remediation="No immediate wellbeing hazards detected.",
        )
