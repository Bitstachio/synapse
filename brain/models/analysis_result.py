from pydantic import BaseModel, Field

from models.user_story_verdict import UserStoryVerdict


class AnalyzeStoryResult(BaseModel):
    """HTTP payload for POST /analyze-story: NLP verdict plus framework freshness metadata."""

    verdict: UserStoryVerdict
    framework_changed_since_last_analysis: bool = Field(
        ...,
        description="True if the active framework updatedAt is newer than the last analysis snapshot (for cache invalidation).",
    )
    framework_sync_message: str = Field(
        ...,
        description="Human-readable framework freshness vs last recorded analysis.",
    )
