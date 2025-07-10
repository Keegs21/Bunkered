from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ReferralCodeBase(BaseModel):
    code: str
    is_active: Optional[bool] = True
    max_uses: Optional[int] = 1
    description: Optional[str] = None


class ReferralCodeCreate(ReferralCodeBase):
    expires_at: Optional[datetime] = None


class ReferralCodeResponse(ReferralCodeBase):
    id: int
    created_by: Optional[int] = None
    current_uses: int
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReferralCodeValidation(BaseModel):
    code: str
    is_valid: bool
    message: str 