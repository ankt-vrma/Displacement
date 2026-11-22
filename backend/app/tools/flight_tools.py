import logging

import httpx

from app.config import settings

log = logging.getLogger(__name__)


async def search_flights(dep_iata: str | None, arr_iata: str | None, limit: int = 10) -> list[dict]:
    """Aviationstack: real flight schedules on a route (it does not provide fares)."""
    if not (dep_iata and arr_iata):
        return []
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            # The free Aviationstack plan only supports http, not https.
            r = await client.get(
                "http://api.aviationstack.com/v1/flights",
                params={
                    "access_key": settings.aviationstack_api_key,
                    "dep_iata": dep_iata,
                    "arr_iata": arr_iata,
                    "limit": limit,
                },
            )
            r.raise_for_status()
        flights = r.json().get("data", [])
        return [
            {
                "airline": (f.get("airline") or {}).get("name"),
                "flight": (f.get("flight") or {}).get("iata"),
                "departure": (f.get("departure") or {}).get("scheduled"),
                "arrival": (f.get("arrival") or {}).get("scheduled"),
                "status": f.get("flight_status"),
            }
            for f in flights
        ]
    except Exception as exc:
        log.warning("Aviationstack failed: %s", exc)
        return []