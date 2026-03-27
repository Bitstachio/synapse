from fastapi import APIRouter

from models.analysis_result import AnalyzeStoryResult
from models.response_schema import StandardResponse
from models.user_story_request import UserStoryRequest
from services.active_framework_service import ActiveFrameworkService
from services.nlp_service import NLPService

router = APIRouter()

active_framework_service = ActiveFrameworkService()
nlp_service = NLPService()


@router.post("/analyze-story", response_model=StandardResponse[AnalyzeStoryResult])
async def analyze_user_story(
    payload: UserStoryRequest,
) -> StandardResponse[AnalyzeStoryResult]:
    content, changed, sync_message = await active_framework_service.get_active_framework_with_freshness()
    verdict = nlp_service.analyze_story(payload.story_text, content)

    return StandardResponse[AnalyzeStoryResult](
        success=True,
        message="Synapse analysis complete",
        data=AnalyzeStoryResult(
            verdict=verdict,
            framework_changed_since_last_analysis=changed,
            framework_sync_message=sync_message,
        ),
    )
