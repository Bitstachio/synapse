from pathlib import Path
from typing import Any
import yaml
from models.user_story_verdict import UserStoryVerdict


class NLPService:
    """
    Service responsible for auditing user stories against the Synapse Wellbeing Framework.

    This service loads a NIST-aligned YAML framework and evaluates text for
    compliance with employee psychosocial safety standards.
    """

    def __init__(self) -> None:
        """Initializes the service and loads the wellbeing policy framework from disk."""
        path = Path(__file__).parent.parent / "core" / "wellbeing_framework.yaml"
        with open(path, "r") as f:
            self.framework: dict[str, Any] = yaml.safe_load(f)

    def generate_audit_context(self) -> str:
        """
        Flattens the hierarchical framework into a string context for the LLM.

        Returns:
            A formatted string containing all function IDs, descriptions, and risk levels.
        """
        lines = ["EXAMINE THE USER STORY AGAINST THESE SYNAPSE CONTROLS:"]
        for fn in self.framework["functions"]:
            for cat in fn["categories"]:
                for sub in cat["subcategories"]:
                    lines.append(
                        f"- [{sub['id']}] {sub['description']} (Risk: {sub['risk_level']})"
                    )
        return "\n".join(lines)

    async def analyze_story(self, text: str) -> UserStoryVerdict:
        """
        Analyzes a user story text to detect potential governance violations.

        Args:
            text: The raw user story description to be audited.

        Returns:
            A UserStoryVerdict containing the safety status, risk score, and violated controls.
        """
        # TODO: integrate with LLM using generate_audit_context()

        # Prototype logic: Trigger violation for monitoring/tracking keywords
        if any(word in text.lower() for word in ["monitor", "track"]):
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
