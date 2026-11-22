import asyncio
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.config import settings

SIGNED_URL_SECONDS = 3600


@lru_cache
def get_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _bucket():
    return get_client().storage.from_(settings.supabase_bucket)


def _signed_url(path: str) -> str | None:
    res = _bucket().create_signed_url(path, SIGNED_URL_SECONDS)
    return res.get("signedURL") or res.get("signedUrl")


def _with_url(row: dict[str, Any]) -> dict[str, Any]:
    row = dict(row)
    row["pdf_url"] = _signed_url(row["pdf_path"]) if row.get("pdf_path") else None
    return row


def _save_sync(user_id: str, thread_id: str, query: str, trip: dict, final_plan: str, pdf: bytes):
    path = f"{user_id}/{thread_id}.pdf"
    _bucket().upload(path, pdf, {"content-type": "application/pdf", "upsert": "true"})
    res = (
        get_client()
        .table("travel_plans")
        .upsert(
            {
                "user_id": user_id,
                "thread_id": thread_id,
                "query": query,
                "trip": trip,
                "final_plan": final_plan,
                "pdf_path": path,
            },
            on_conflict="thread_id",
        )
        .execute()
    )
    return _with_url(res.data[0])


def _list_sync(user_id: str) -> list[dict[str, Any]]:
    res = (
        get_client()
        .table("travel_plans")
        .select("id, thread_id, query, trip, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return res.data


def _get_sync(plan_id: str, user_id: str) -> dict[str, Any] | None:
    res = (
        get_client()
        .table("travel_plans")
        .select("*")
        .eq("id", plan_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return _with_url(res.data[0]) if res.data else None


def _delete_sync(plan_id: str, user_id: str) -> bool:
    client = get_client()
    res = (
        client.table("travel_plans")
        .select("id, pdf_path")
        .eq("id", plan_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not res.data:
        return False
    if res.data[0].get("pdf_path"):
        _bucket().remove([res.data[0]["pdf_path"]])
    client.table("travel_plans").delete().eq("id", plan_id).eq("user_id", user_id).execute()
    return True


async def save_plan(user_id: str, thread_id: str, query: str, trip: dict, final_plan: str, pdf: bytes):
    return await asyncio.to_thread(_save_sync, user_id, thread_id, query, trip, final_plan, pdf)


async def list_plans(user_id: str):
    return await asyncio.to_thread(_list_sync, user_id)


async def get_plan(plan_id: str, user_id: str):
    return await asyncio.to_thread(_get_sync, plan_id, user_id)


async def delete_plan(plan_id: str, user_id: str) -> bool:
    return await asyncio.to_thread(_delete_sync, plan_id, user_id)