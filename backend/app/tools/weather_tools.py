import logging

import httpx

from app.config import settings

log = logging.getLogger(__name__)


async def get_forecast(location: str, days: int = 3) -> list[dict]:
    """WeatherAPI forecast. Free plans cap the number of forecast days."""
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(
                "https://api.weatherapi.com/v1/forecast.json",
                params={
                    "key": settings.weatherapi_key,
                    "q": location,
                    "days": max(1, min(days, 14)),
                    "aqi": "no",
                    "alerts": "no",
                },
            )
            r.raise_for_status()
        return [
            {
                "date": d["date"],
                "condition": d["day"]["condition"]["text"],
                "max_c": d["day"]["maxtemp_c"],
                "min_c": d["day"]["mintemp_c"],
                "rain_chance_pct": d["day"]["daily_chance_of_rain"],
            }
            for d in r.json()["forecast"]["forecastday"]
        ]
    except Exception as exc:
        log.warning("WeatherAPI failed: %s", exc)
        return []