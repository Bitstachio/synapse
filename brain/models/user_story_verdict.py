from typing import List, Optional

from pydantic import BaseModel, Field


class UserStoryVerdict(BaseModel):
    is_safe: bool
    risk_score: float
    violated_controls: List[str]
    remediation: str
    framework_id: Optional[str] = Field(
        default=None,
        description="Framework document id when known (e.g. prototype JSON data._id).",
    )
