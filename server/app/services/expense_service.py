# app/services/expense_service.py
from datetime import datetime
from app.db.firebase_config import expenses_collection
from google.cloud.firestore_v1.base_query import FieldFilter
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

def create_expense(expense: ExpenseCreate):
    """Logs a new expense in Firestore."""
    doc_ref = expenses_collection.document()
    expense_data = expense.model_dump()
    expense_data["date"] = datetime.now().isoformat()
    doc_ref.set(expense_data)
    return {"id": doc_ref.id, **expense_data}

def get_expense(expense_id: str):
    """Retrieves a single expense by its ID."""
    doc = expenses_collection.document(expense_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None

def get_all_expenses():
    """Retrieves all expenses."""
    expenses = []
    docs = expenses_collection.stream()
    for doc in docs:
        expenses.append({"id": doc.id, **doc.to_dict()})
    return expenses

def get_expenses_by_date(date: str):
    """Retrieves all expenses for a specific date and calculates the total."""
    expenses = []
    total = 0.0
    
    start_of_day = date + "T00:00:00"
    end_of_day = date + "T23:59:59.999999"
    
    docs = expenses_collection.where(
        filter=FieldFilter("date", ">=", start_of_day)
    ).where(
        filter=FieldFilter("date", "<=", end_of_day)
    ).stream()

    for doc in docs:
        expense_data = doc.to_dict()
        expenses.append({"id": doc.id, **expense_data})
        total += expense_data.get("amount", 0.0)
        
    return {"expenses": expenses, "total_expenses": total}

def update_expense(expense_id: str, expense_update: ExpenseUpdate):
    """Updates an expense document."""
    expense_ref = expenses_collection.document(expense_id)
    update_data = {k: v for k, v in expense_update.model_dump().items() if v is not None}
    
    if not update_data:
        return None # Or raise an error if you prefer

    expense_ref.update(update_data)
    return {"id": expense_id, **update_data}


def delete_expense(expense_id: str):
    """Deletes an expense document."""
    expense_ref = expenses_collection.document(expense_id)
    if expense_ref.get().exists:
        expense_ref.delete()
        return {"status": "success", "message": f"Expense {expense_id} deleted."}
    return None


# --- FUNCTIONS FOR TRANSACTIONS ---

def update_expense_in_transaction(transaction, expense_id: str, amount: float, description: str):
    """Updates an expense document within a transaction."""
    expense_ref = expenses_collection.document(expense_id)
    transaction.update(expense_ref, {
        "amount": amount,
        "description": description
    })

def delete_expense_in_transaction(transaction, expense_id: str):
    """Deletes an expense document within a transaction."""
    expense_ref = expenses_collection.document(expense_id)
    transaction.delete(expense_ref)