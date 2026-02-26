from pydantic import BaseModel, Field


class UserStoryRequest(BaseModel):
    story_text: str = Field(
        ..., min_length=10, description="The raw user story text from Jira"
    )
