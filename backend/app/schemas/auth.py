from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(..., pattern="^(student|recruiter)$")
    name: str = Field(..., min_length=1, max_length=255)
    # For recruiter registration
    company_name: str | None = None
    company_industry: str | None = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
