from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from models.response_schema import StandardResponse


async def global_exception_handler(request: Request, exc: Exception):
    print(f"CRITICAL ERROR: {str(exc)}")

    # TODO: Determine if the use of [Any] is appropriate
    error_payload = StandardResponse[Any](
        success=False,
        message="An unexpected error occurred in the Intelligence Brain.",
        error_code="INTERNAL_SERVER_ERROR",
        data=None,
    )

    return JSONResponse(status_code=500, content=error_payload.model_dump())


async def http_exception_handler(request: Request, exc: HTTPException):
    # TODO: Determine if the use of [Any] is appropriate
    error_payload = StandardResponse[Any](
        success=False, message=exc.detail, error_code="CLIENT_ERROR", data=None
    )

    return JSONResponse(status_code=exc.status_code, content=error_payload.model_dump())
