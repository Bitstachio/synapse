from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

# T represents the dynamic data payload (like your SafetyVerdict)
T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    error_code: Optional[str] = None

    class Config:
        from_attributes = True
