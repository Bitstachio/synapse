from fastapi import APIRouter

from models.response_schema import StandardResponse
from models.user_story_request import UserStoryRequest
from models.user_story_verdict import UserStoryVerdict
from services.nlp_service import NLPService

router = APIRouter()

# Instantiate the service
# Later, we can use 'Depends' for cleaner dependency injection
nlp_service = NLPService()


@router.post("/analyze-story", response_model=StandardResponse[UserStoryVerdict])
async def analyze_user_story(
    payload: UserStoryRequest,
) -> StandardResponse[UserStoryVerdict]:
    result = await nlp_service.analyze_story(payload.story_text)

    return StandardResponse[UserStoryVerdict](
        success=True, message="Synapse analysis complete", data=result
    )
