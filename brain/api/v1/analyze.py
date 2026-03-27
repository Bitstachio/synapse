from fastapi import APIRouter

from models.analysis_result import AnalyzeStoryResult
from models.response_schema import StandardResponse
from models.user_story_request import UserStoryRequest
from services.nlp_service import NLPService

router = APIRouter()

nlp_service = NLPService()


@router.post("/analyze-story", response_model=StandardResponse[AnalyzeStoryResult])
async def analyze_user_story(
    payload: UserStoryRequest,
) -> StandardResponse[AnalyzeStoryResult]:
    verdict = nlp_service.analyze_story(payload.story_text)

    return StandardResponse[AnalyzeStoryResult](
        success=True,
        message="Synapse analysis complete (prototype)",
        data=AnalyzeStoryResult(
            verdict=verdict,
            received_story_text=payload.story_text,
            framework_changed_since_last_analysis=False,
            framework_sync_message=(
                "Prototype: using local active-framework-response.json; "
                "live Framework API / freshness is disabled."
            ),
        ),
    )
