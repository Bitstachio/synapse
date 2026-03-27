import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai

from api.v1.analyze import router as analyze_router
from core.exceptions import global_exception_handler, http_exception_handler
from models.response_schema import StandardResponse

load_dotenv(Path(__file__).resolve().parent / ".env")

# Use a current model id from https://ai.google.dev/gemini-api/docs/models
GEMINI_TEST_MODEL = "gemini-2.5-flash"
_GEMINI_TEST_PROMPT = (
    "Reply in one short sentence only. Confirm you received this test message: "
    "'Synapse brain Gemini connectivity check.'"
)

app = FastAPI(
    title="Auditor Brain",
    description="NLP governance service for enterprise project management",
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# Routers
app.include_router(analyze_router, prefix="/api/v1", tags=["Analysis"])


# Basic health check to test the standard response format
@app.get("/health", response_model=StandardResponse[dict[str, str]])
async def health_check():
    return StandardResponse(
        success=True,
        message="Intelligence Brain is operational",
        data={"status": "healthy"},
    )


@app.get("/test", response_model=StandardResponse[dict[str, str]])
async def gemini_connectivity_test() -> StandardResponse[dict[str, str]]:
    """Calls Gemini with fixed sample text to verify API key and SDK setup."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_API_KEY is not set. Add it to brain/.env or the environment.",
        )

    def _call_gemini() -> str:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_TEST_MODEL,
            contents=_GEMINI_TEST_PROMPT,
        )
        return response.text or ""

    try:
        reply = await asyncio.to_thread(_call_gemini)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API request failed: {exc}",
        ) from exc

    return StandardResponse(
        success=True,
        message="Gemini connectivity test succeeded",
        data={"model": GEMINI_TEST_MODEL, "reply": reply},
    )
