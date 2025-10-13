# app/api/v1/endpoints/expenses.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseInDB, ExpensesByDateResponse
from app.services import expense_service
from app.core.security import get_current_user, require_l2_permission

router = APIRouter()

@router.post("/", response_model=ExpenseInDB, status_code=status.HTTP_201_CREATED)
def add_new_expense(
    expense: ExpenseCreate,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can create
):
    """
    Create a new expense.
    L1 and L2 users can create expenses.
    """
    new_expense = expense_service.create_expense(expense)
    return new_expense

@router.get("/", response_model=List[ExpenseInDB])
def read_all_expenses(
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve all expenses.
    L1 and L2 users can read expenses.
    """
    expenses = expense_service.get_all_expenses()
    return expenses

@router.get("/{expense_id}", response_model=ExpenseInDB)
def read_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve a single expense by ID.
    L1 and L2 users can read expenses.
    """
    expense = expense_service.get_expense(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.get("/by_date/{date}", response_model=ExpensesByDateResponse)
def read_expenses_by_date(
    date: str,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve all expenses for a specific date (YYYY-MM-DD) and the total for that day.
    L1 and L2 users can read expenses.
    """
    result = expense_service.get_expenses_by_date(date)
    return result

@router.put("/{expense_id}", response_model=ExpenseInDB)
def update_existing_expense(
    expense_id: str,
    expense: ExpenseUpdate,
    current_user: dict = Depends(require_l2_permission)  # Only L2 can update
):
    """
    Update an expense.
    Only L2 users can update expenses.
    """
    updated_expense = expense_service.update_expense(expense_id, expense)
    if not updated_expense:
        raise HTTPException(status_code=404, detail="Expense not found or no new data provided")
    # Fetch the full document to return it
    return read_expense(expense_id)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_expense(
    expense_id: str,
    current_user: dict = Depends(require_l2_permission)  # Only L2 can delete
):
    """
    Delete an expense.
    Only L2 users can delete expenses.
    """
    result = expense_service.delete_expense(expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return None