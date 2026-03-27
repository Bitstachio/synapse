from typing import Any, Optional

from models.user_story_verdict import UserStoryVerdict


class NLPService:
    """Audits user story text against a Synapse framework content tree (LLM integration TBD)."""

    def analyze_story(
        self,
        text: str,
        framework_content: Optional[dict[str, Any]],
    ) -> UserStoryVerdict:
        if not framework_content:
            return UserStoryVerdict(
                is_safe=False,
                risk_score=1.0,
                violated_controls=[],
                remediation="No active framework content was provided for analysis.",
            )

        # TODO: Integrate with LLM (e.g., Gemini) using generate_audit_context(framework_content)

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

    @staticmethod
    def generate_audit_context(framework: dict[str, Any]) -> str:
        """Flattens the hierarchical JSON into a string context for the LLM."""
        lines = ["EXAMINE THE USER STORY AGAINST THESE SYNAPSE CONTROLS:"]

        for cat in framework.get("categories", []):
            for sub in cat.get("subcategories", []):
                for instr in sub.get("instructions", []):
                    iid = instr.get("id", "?")
                    desc = instr.get("description", "")
                    risk = instr.get("risk_level", "n/a")
                    lines.append(f"- [{iid}] {desc} (Risk: {risk})")

        return "\n".join(lines)
