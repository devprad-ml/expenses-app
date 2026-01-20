from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    
    # Financial Settings
    monthly_budget_limit = Column(Float, default=0.0) # 0 means no limit
    
    # Relationships (One User has Many Expenses)
    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")