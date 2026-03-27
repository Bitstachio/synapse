import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

_DEFAULT_FRAMEWORK_API = "http://localhost:3001"


def _parse_iso8601(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        s = value.replace("Z", "+00:00") if value.endswith("Z") else value
        dt = datetime.fromisoformat(s)
    else:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


class ActiveFrameworkService:
    """
    Fetches the active framework from the Framework API and tracks whether its `updatedAt`
    changed since the last recorded analysis (for caching and client messaging).
    """

    def __init__(self, api_base_url: Optional[str] = None) -> None:
        base = (
            api_base_url or os.environ.get("FRAMEWORK_API_BASE_URL") or _DEFAULT_FRAMEWORK_API
        ).rstrip("/")
        self._active_url = f"{base}/api/v1/frameworks/active"
        self._last_recorded_framework_updated_at: Optional[datetime] = None

    def _auth_headers(self) -> dict[str, str]:
        token = os.environ.get("FRAMEWORK_API_BEARER_TOKEN", "").strip()
        if not token:
            return {}
        return {"Authorization": f"Bearer {token}"}

    async def get_active_framework_with_freshness(
        self,
    ) -> tuple[Optional[dict[str, Any]], bool, str]:
        """
        Fetches the active framework, compares `updatedAt` to the last snapshot, and updates
        the snapshot when the framework is new or newer than the last recorded time.

        Returns:
            (framework_content, framework_changed_since_last_analysis, sync_message)
        """
        content: Optional[dict[str, Any]] = None
        updated_at: Optional[datetime] = None

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self._active_url,
                    timeout=10.0,
                    headers=self._auth_headers(),
                )
                response.raise_for_status()
                payload = response.json()
                data = payload.get("data")
                if not isinstance(data, dict):
                    raise ValueError("Invalid response: missing data object")

                content = data.get("content")
                if content is not None and not isinstance(content, dict):
                    content = None
                updated_at = _parse_iso8601(data.get("updatedAt"))
                logger.info(
                    "Active framework loaded: %s (v%s)",
                    data.get("name"),
                    data.get("version"),
                )
            except httpx.HTTPStatusError as e:
                status = e.response.status_code
                logger.error(
                    "Framework API HTTP %s for %s: %s",
                    status,
                    self._active_url,
                    e.response.text[:500] if e.response.text else "",
                )
                if status == 401:
                    return (
                        None,
                        True,
                        "Framework API returned 401 Unauthorized. "
                        "Set FRAMEWORK_API_BEARER_TOKEN in brain/.env to a JWT with READ_FRAMEWORKS access.",
                    )
                if status == 403:
                    return (
                        None,
                        True,
                        "Framework API returned 403 Forbidden. The bearer token may lack permission to read frameworks.",
                    )
                if status == 404:
                    return (
                        None,
                        True,
                        "No active framework is configured (404). Activate a framework in the Framework Manager.",
                    )
                return (
                    None,
                    True,
                    f"Framework API returned HTTP {status}; could not load the active framework.",
                )
            except httpx.RequestError as e:
                logger.error("Framework API request failed: %s", e)
                return (
                    None,
                    True,
                    f"Could not reach the Framework API at {self._active_url}. "
                    f"Check FRAMEWORK_API_BASE_URL and that the server is running. ({e!s})",
                )
            except (ValueError, TypeError, KeyError) as e:
                logger.error("Unexpected Framework API response: %s", e)
                return (
                    None,
                    True,
                    f"Unexpected Framework API response shape: {e!s}",
                )

        changed, message = self._evaluate_freshness(updated_at)
        return (content, changed, message)

    def _evaluate_freshness(self, fw_at: Optional[datetime]) -> tuple[bool, str]:
        if fw_at is None:
            return (
                True,
                "Active framework loaded but `updatedAt` was missing from the API response.",
            )

        last = self._last_recorded_framework_updated_at
        if last is None:
            self._last_recorded_framework_updated_at = fw_at
            return (
                True,
                "First analysis in this process; active framework snapshot recorded for future comparisons.",
            )

        if fw_at > last:
            self._last_recorded_framework_updated_at = fw_at
            return (
                True,
                "The active framework has been updated since the last analysis; snapshot refreshed.",
            )

        return (
            False,
            "The active framework has not changed since the last analysis.",
        )
