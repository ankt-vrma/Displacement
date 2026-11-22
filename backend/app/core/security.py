from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.config import settings

if len(settings.jwt_secret) < 32:
    raise RuntimeError("JWT_SECRET is missing or too short (min 32 chars). Set it in .env")

_hasher = PasswordHash.recommended()  # argon2
_DUMMY_HASH = _hasher.hash("timing-equaliser-password")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _hasher.verify(password, password_hash)


def burn_hash_time(password: str) -> None:
    """Called when the email is unknown, so response time doesn't reveal which emails exist."""
    _hasher.verify(password, _DUMMY_HASH)


def _create_token(user_id: str, token_type: str, lifetime: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "type": token_type, "iat": now, "exp": now + lifetime}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str) -> str:
    return _create_token(user_id, "access", timedelta(minutes=settings.access_token_minutes))


def create_refresh_token(user_id: str) -> str:
    return _create_token(user_id, "refresh", timedelta(days=settings.refresh_token_days))


def decode_token(token: str, expected_type: str) -> dict:
    """Raises jwt.PyJWTError if the token is invalid, expired or the wrong type."""
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        options={"require": ["exp", "sub"]},
    )
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("Wrong token type")
    return payload