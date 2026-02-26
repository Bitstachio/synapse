from typing import List

from pydantic import BaseModel


class UserStoryVerdict(BaseModel):
    is_safe: bool
    risk_score: float
    detected_issues: List[str]
    remediation: str
