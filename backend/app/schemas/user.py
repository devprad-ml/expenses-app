from pydantic import BaseModel, EmailStr
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    monthly_budget_limit: Optional[float] = None
    full_name: Optional[str] = None

# Properties to return to client
class UserResponse(UserBase):
    id: int
    monthly_budget_limit: float

    class Config:
        from_attributes = True


# Properties to return to client (NEVER return the password)
class UserResponse(UserBase):
    id: int
    monthly_budget_limit: float

    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str