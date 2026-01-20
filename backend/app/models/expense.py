from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base

class ExpenseCategory(str, enum.Enum):
    FOOD = "food"
    RENT = "rent"
    TRANSPORT = "transport"
    ENTERTAINMENT = "entertainment"
    PERSONAL = "personal"
    UTILITIES = "utilities"
    HEALTH = "health"
    OTHER = "other"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False) # e.g. "Lunch at McD"
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    
    # Categorization
    category = Column(Enum(ExpenseCategory), default=ExpenseCategory.OTHER)
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="expenses")