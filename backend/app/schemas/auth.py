from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(None, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: str
    home_city: str | None = None
    home_airport_iata: str | None = None
    preferred_currency: str | None = None
    travel_preferences: dict[str, Any] = {}
    created_at: str


class ProfileUpdate(BaseModel):
    # Only these fields are editable. email, role and is_active are deliberately absent
    # so a client can't promote itself to admin.
    full_name: str | None = Field(None, max_length=100)
    home_city: str | None = Field(None, max_length=100)
    home_airport_iata: str | None = Field(None, pattern=r"^[A-Za-z]{3}$")
    preferred_currency: str | None = Field(None, pattern=r"^[A-Za-z]{3}$")
    travel_preferences: dict[str, Any] | None = None

    @field_validator("home_airport_iata", "preferred_currency")
    @classmethod
    def _upper(cls, v: str | None) -> str | None:
        return v.upper() if v else v


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)