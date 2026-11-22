import asyncio

import jwt
from fastapi import APIRouter, HTTPException

from app.core.security import (
    burn_hash_time,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from app.services import user_service
from app.services.user_service import EmailAlreadyRegistered

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens(user_id: str) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/register", response_model=UserOut, status_code=201)
async def register(body: RegisterRequest):
    password_hash = await asyncio.to_thread(hash_password, body.password)  # argon2 is CPU-heavy
    try:
        return await user_service.create_user(body.email.lower(), password_hash, body.full_name)
    except EmailAlreadyRegistered:
        raise HTTPException(409, "An account with this email already exists")


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    invalid = HTTPException(401, "Invalid email or password")
    user = await user_service.get_by_email(body.email.lower())
    if not user:
        await asyncio.to_thread(burn_hash_time, body.password)
        raise invalid
    ok = await asyncio.to_thread(verify_password, body.password, user["password_hash"])
    if not ok or not user["is_active"]:
        raise invalid
    return _tokens(user["id"])


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    invalid = HTTPException(401, "Invalid or expired refresh token")
    try:
        payload = decode_token(body.refresh_token, "refresh")
    except jwt.PyJWTError:
        raise invalid
    user = await user_service.get_by_id(payload["sub"])
    if not user or not user["is_active"]:
        raise invalid
    return _tokens(user["id"])