import asyncio

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, require_admin
from app.core.security import hash_password, verify_password
from app.schemas.auth import ChangePasswordRequest, ProfileUpdate, UserOut
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(user: dict = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
async def update_me(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    fields = body.model_dump(exclude_unset=True)
    if not fields:
        return user
    return await user_service.update_user(user["id"], fields)


@router.post("/me/password", status_code=204)
async def change_password(body: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    ok = await asyncio.to_thread(verify_password, body.current_password, user["password_hash"])
    if not ok:
        raise HTTPException(400, "Current password is incorrect")
    new_hash = await asyncio.to_thread(hash_password, body.new_password)
    await user_service.update_user(user["id"], {"password_hash": new_hash})


@router.get("", response_model=list[UserOut])
async def list_all_users(_: dict = Depends(require_admin)):
    """Admin-only example of role-based authorization."""
    return await user_service.list_users()