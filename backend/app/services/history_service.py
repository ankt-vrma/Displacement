import asyncio
import logging

from app.services.supabase_service import get_client

log = logging.getLogger(__name__)


def _log_sync(user_id: str, text: str, kind: str, status: str, thread_id: str | None):
    get_client().table("query_history").insert(
        {"user_id": user_id, "text": text, "kind": kind, "status": status, "thread_id": thread_id}
    ).execute()


async def log_query(user_id: str, text: str, kind: str, status: str, thread_id: str | None = None):
    """Best effort: a logging failure must never break the user's request."""
    try:
        await asyncio.to_thread(_log_sync, user_id, text, kind, status, thread_id)
    except Exception:
        log.warning("Failed to log query history", exc_info=True)


def _list_sync(user_id: str, limit: int, offset: int, kind: str | None):
    client = get_client()
    q = (
        client.table("query_history")
        .select("id, thread_id, kind, text, status, created_at")
        .eq("user_id", user_id)
    )
    if kind:
        q = q.eq("kind", kind)
    rows = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute().data

    # Attach plan_id for queries that ended in an approved, saved plan
    thread_ids = [r["thread_id"] for r in rows if r.get("thread_id")]
    plan_by_thread: dict[str, str] = {}
    if thread_ids:
        plans = (
            client.table("travel_plans")
            .select("id, thread_id")
            .eq("user_id", user_id)
            .in_("thread_id", thread_ids)
            .execute()
            .data
        )
        plan_by_thread = {p["thread_id"]: p["id"] for p in plans}
    for r in rows:
        r["plan_id"] = plan_by_thread.get(r.get("thread_id"))
    return rows


async def list_queries(user_id: str, limit: int = 50, offset: int = 0, kind: str | None = None):
    return await asyncio.to_thread(_list_sync, user_id, limit, offset, kind)