# app/main.py
from fastapi import FastAPI, HTTPException

from core.exceptions import global_exception_handler, http_exception_handler

app = FastAPI(
    title="Aegis Intelligence Brain",
    description="NLP Governance Service for Enterprise AI",
)

# Register the global exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)


# Basic health check to test the standard response format
@app.get("/health")
async def health_check():
    return {
        "success": True,
        "message": "Intelligence Brain is operational",
        "data": {"status": "healthy"},
    }
