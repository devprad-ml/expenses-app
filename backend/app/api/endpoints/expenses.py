from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, extract

from app.db.session import get_db
from app.models.user import User
from app.models.expense import Expense, ExpenseCategory
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseLogRequest
from app.services.ai_parser import ai_parser
from app.api.endpoints.auth import get_current_active_user # We need to create this dependency helper next!

router = APIRouter()


@router.post("/parse", response_model=ExpenseCreate)
async def parse_expense_text(request: ExpenseLogRequest):
    """
    Takes a string like "Uber to work $15" and returns structured JSON.
    Does NOT save to DB yet (User confirms first).
    """
    parsed_data = await ai_parser.parse_text(request.text)
    return parsed_data

# --- 2. Create Expense (Save) ---
@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense_in: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check Monthly Budget
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    # Calculate total spent this month
    query = select(Expense).where(
        Expense.user_id == current_user.id,
        extract('month', Expense.date) == current_month,
        extract('year', Expense.date) == current_year
    )
    result = await db.execute(query)
    expenses = result.scalars().all()
    total_spent = sum(e.amount for e in expenses)
    
    # Logic: We warn, but don't block (optional: raise HTTPException to block)
    if current_user.monthly_budget_limit > 0:
        if (total_spent + expense_in.amount) > current_user.monthly_budget_limit:
            print(f"WARNING: User {current_user.email} exceeded budget!")

    new_expense = Expense(
        **expense_in.model_dump(),
        user_id=current_user.id
    )
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    return new_expense

# --- 3. Get Expenses (With Filters) ---
@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    month: Optional[int] = None,
    category: Optional[ExpenseCategory] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get expenses with optional filters: Month, Category, Price Range.
    """
    query = select(Expense).where(Expense.user_id == current_user.id)
    
    if month:
        query = query.where(extract('month', Expense.date) == month)
        # Assumes current year, or add year param
        query = query.where(extract('year', Expense.date) == datetime.utcnow().year)
        
    if category:
        query = query.where(Expense.category == category)
        
    if min_price:
        query = query.where(Expense.amount >= min_price)
        
    if max_price:
        query = query.where(Expense.amount <= max_price)
        
    # Order by date descending (newest first)
    query = query.order_by(Expense.date.desc())
        
    result = await db.execute(query)
    return result.scalars().all()