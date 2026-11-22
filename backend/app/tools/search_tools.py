import logging

from tavily import AsyncTavilyClient

from app.config import settings

log = logging.getLogger(__name__)


async def web_search(query: str, max_results: int = 5) -> list[dict]:
    try:
        client = AsyncTavilyClient(api_key=settings.tavily_api_key)
        res = await client.search(query=query, max_results=max_results, search_depth="basic")
        return [
            {"title": r.get("title"), "url": r.get("url"), "content": r.get("content")}
            for r in res.get("results", [])
        ]
    except Exception as exc:
        log.warning("Tavily failed: %s", exc)
        return []