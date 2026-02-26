from fastapi import APIRouter

from models.response_schema import StandardResponse
from models.user_story_request import UserStoryRequest
from models.user_story_verdict import UserStoryVerdict

# In a real app, you'd use Dependency Injection for the service
# For now, we'll keep it simple
router = APIRouter()


@router.post("/analyze-story", response_model=StandardResponse[UserStoryVerdict])
async def analyze_user_story(
    payload: UserStoryRequest,
) -> StandardResponse[UserStoryVerdict]:
    # This is where we will eventually call our nlp_service
    # For this step, we'll just mock the service call
    mock_data = UserStoryVerdict(
        is_safe=True,
        risk_score=0.1,
        detected_issues=[],
        remediation="Standard compliance met.",
    )

    return StandardResponse[UserStoryVerdict](
        success=True, message="User story analyzed successfully", data=mock_data
    )
