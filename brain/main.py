from fastapi import FastAPI, HTTPException

from api.v1.analyze import router as analyze_router
from core.exceptions import global_exception_handler, http_exception_handler
from models.response_schema import StandardResponse

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
