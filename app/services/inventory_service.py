# app/services/inventory_service.py
from firebase_admin import firestore
from app.db.firebase_config import db, inventory_collection
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.schemas.expense import ExpenseCreate # <--- IMPORT THIS
from app.services import expense_service

# --- CREATE (Modified to link expense) ---
def create_item(item: InventoryCreate):
    """Creates a new inventory item and logs the purchase as a linked expense."""
    # 1. Create the expense first
    total_purchase_cost = item.purchasePrice * item.quantity
    description = f"Inventory Purchase: {item.quantity} x {item.itemName} ({item.modelNumber})"
    
    # Create an ExpenseCreate object
    expense_to_create = ExpenseCreate(
        description=description,
        amount=total_purchase_cost,
        category="Inventory"  # Assign a default category
    )
    new_expense = expense_service.create_expense(expense_to_create) # Pass the object
    
    # 2. Create the inventory item, storing the expense ID
    inventory_data = item.model_dump()
    inventory_data['expenseId'] = new_expense['id'] # Link the expense

    doc_ref = inventory_collection.document()
    doc_ref.set(inventory_data)
    
    return {"id": doc_ref.id, **inventory_data}

# --- READ (Unchanged) ---
def get_item(item_id: str):
    doc = inventory_collection.document(item_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None

def get_all_items():
    items = []
    docs = inventory_collection.stream()
    for doc in docs:
        items.append({"id": doc.id, **doc.to_dict()})
    return items

# --- UPDATE (Rewritten to use a transaction) ---
@firestore.transactional
def update_item_transaction(transaction, item_id: str, item_update: InventoryUpdate):
    item_ref = inventory_collection.document(item_id)
    item_snapshot = item_ref.get(transaction=transaction)

    if not item_snapshot.exists:
        raise ValueError("Item not found")

    item_data = item_snapshot.to_dict()
    update_data = {k: v for k, v in item_update.model_dump().items() if v is not None}

    # Check if we need to update the linked expense
    if 'quantity' in update_data or 'purchasePrice' in update_data:
        expense_id = item_data.get('expenseId')
        if expense_id:
            # Use new value if provided, otherwise fall back to existing value
            new_quantity = update_data.get('quantity', item_data['quantity'])
            new_price = update_data.get('purchasePrice', item_data['purchasePrice'])
            item_name = update_data.get('itemName', item_data['itemName'])
            model_num = update_data.get('modelNumber', item_data['modelNumber'])

            # Recalculate and update the expense
            new_total_cost = new_quantity * new_price
            new_description = f"Inventory Purchase: {new_quantity} x {item_name} ({model_num})"
            expense_service.update_expense_in_transaction(transaction, expense_id, new_total_cost, new_description)

    transaction.update(item_ref, update_data)
    return {**item_data, **update_data}

def update_item(item_id: str, item_update: InventoryUpdate):
    """Public function to initiate the item update transaction."""
    transaction = db.transaction()
    try:
        updated_data = update_item_transaction(transaction, item_id, item_update)
        return {"id": item_id, **updated_data}
    except ValueError:
        return None


# --- DELETE (Rewritten to use a transaction) ---
@firestore.transactional
def delete_item_transaction(transaction, item_id: str):
    item_ref = inventory_collection.document(item_id)
    item_snapshot = item_ref.get(transaction=transaction)

    if not item_snapshot.exists:
        raise ValueError("Item not found")

    # If a linked expense exists, delete it too
    expense_id = item_snapshot.to_dict().get('expenseId')
    if expense_id:
        expense_service.delete_expense_in_transaction(transaction, expense_id)

    transaction.delete(item_ref)

def delete_item(item_id: str):
    """Public function to initiate the item delete transaction."""
    transaction = db.transaction()
    try:
        delete_item_transaction(transaction, item_id)
        return {"status": "success", "message": f"Item {item_id} and linked expense deleted."}
    except ValueError:
        return None