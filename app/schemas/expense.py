# app/schemas/expense.py
from pydantic import BaseModel
from typing import Optional, List

class ExpenseBase(BaseModel):
    description: str
    amount: float
    category: str  # Add category field

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None

class ExpenseInDB(ExpenseBase):
    id: str
    date: str

class ExpensesByDateResponse(BaseModel):
    expenses: List[ExpenseInDB]
    total_expenses: float