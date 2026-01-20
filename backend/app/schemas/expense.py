from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.expense import ExpenseCategory

# Base properties shared by creation and reading
class ExpenseBase(BaseModel):
    description: str
    amount: float
    category: ExpenseCategory = ExpenseCategory.OTHER
    date: Optional[datetime] = None

# What the API expects when creating an expense
class ExpenseCreate(ExpenseBase):
    pass

# What the API returns to the frontend
class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

# Special schema for the AI input
class ExpenseLogRequest(BaseModel):
    text: str # e.g. "Spent $15 on lunch"