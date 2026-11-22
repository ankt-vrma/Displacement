import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.services import user_service

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    unauthorized = HTTPException(
        401, "Invalid or expired token", headers={"WWW-Authenticate": "Bearer"}
    )
    if creds is None:
        raise unauthorized
    try:
        payload = decode_token(creds.credentials, "access")
    except jwt.PyJWTError:
        raise unauthorized

    # Loaded from the DB on every request, so deactivating a user or changing a role
    # takes effect immediately instead of waiting for the token to expire.
    user = await user_service.get_by_id(payload["sub"])
    if not user or not user["is_active"]:
        raise unauthorized
    return user


def require_role(*roles: str):
    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(403, "You do not have permission to do this")
        return user

    return checker


require_admin = require_role("admin")