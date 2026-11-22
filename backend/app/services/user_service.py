import asyncio
from typing import Any

from postgrest.exceptions import APIError

from app.services.supabase_service import get_client


class EmailAlreadyRegistered(Exception):
    pass


def _users():
    return get_client().table("users")


def _one(res) -> dict[str, Any] | None:
    return res.data[0] if res.data else None


def _create_sync(email: str, password_hash: str, full_name: str | None):
    try:
        res = _users().insert(
            {"email": email, "password_hash": password_hash, "full_name": full_name}
        ).execute()
    except APIError as exc:
        if getattr(exc, "code", None) == "23505" or "duplicate key" in str(exc).lower():
            raise EmailAlreadyRegistered from exc
        raise
    return res.data[0]


def _get_by_email_sync(email: str):
    return _one(_users().select("*").eq("email", email).limit(1).execute())


def _get_by_id_sync(user_id: str):
    return _one(_users().select("*").eq("id", user_id).limit(1).execute())


def _update_sync(user_id: str, fields: dict[str, Any]):
    return _one(_users().update(fields).eq("id", user_id).execute())


def _list_sync(limit: int):
    return _users().select("*").order("created_at", desc=True).limit(limit).execute().data


async def create_user(email: str, password_hash: str, full_name: str | None):
    return await asyncio.to_thread(_create_sync, email, password_hash, full_name)


async def get_by_email(email: str):
    return await asyncio.to_thread(_get_by_email_sync, email)


async def get_by_id(user_id: str):
    return await asyncio.to_thread(_get_by_id_sync, user_id)


async def update_user(user_id: str, fields: dict[str, Any]):
    return await asyncio.to_thread(_update_sync, user_id, fields)


async def list_users(limit: int = 100):
    return await asyncio.to_thread(_list_sync, limit)