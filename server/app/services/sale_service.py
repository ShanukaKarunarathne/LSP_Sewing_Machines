# app/services/sale_service.py
from datetime import datetime
from firebase_admin import firestore
from app.db.firebase_config import db, inventory_collection, sales_collection, credit_collection
from app.schemas.sale import SaleCreate, SaleUpdate
from app.schemas.credit import CreditRecordCreate
from google.cloud.firestore_v1.base_query import FieldFilter

@firestore.transactional
def process_sale_transaction(transaction, sale_data: SaleCreate):
    """
    Processes a sale of multiple items within a transaction to ensure atomicity.
    """
    item_refs_and_data = []
    
    # --- 1. READ PHASE ---
    for item_sold in sale_data.items:
        item_ref = inventory_collection.document(item_sold.itemId)
        item_snapshot = item_ref.get(transaction=transaction)
        
        if not item_snapshot.exists:
            raise ValueError(f"Inventory item with ID {item_sold.itemId} not found.")
        
        item_data = item_snapshot.to_dict()
        item_refs_and_data.append((item_ref, item_data, item_sold))

    # --- 2. VALIDATION PHASE ---
    for _, item_data, item_sold in item_refs_and_data:
        if item_data['quantity'] < item_sold.quantitySold:
            raise ValueError(f"Insufficient stock for {item_data['itemName']}. Available: {item_data['quantity']}, Requested: {item_sold.quantitySold}.")

    # --- 3. WRITE PHASE ---
    total_sale_amount = 0.0
    processed_items = []
    
    for item_ref, item_data, item_sold in item_refs_and_data:
        new_quantity = item_data['quantity'] - item_sold.quantitySold
        transaction.update(item_ref, {'quantity': new_quantity})

        price_per_item = item_sold.sellingPrice if item_sold.sellingPrice is not None else item_data['sellingPrice']
        item_total_amount = price_per_item * item_sold.quantitySold
        total_sale_amount += item_total_amount

        processed_items.append({
            "itemId": item_sold.itemId,
            "itemName": item_data['itemName'],  # ADD: Item name
            "modelNumber": item_data['modelNumber'],  # ADD: Model number
            "quantitySold": item_sold.quantitySold,
            "pricePerItem": price_per_item,
            "totalAmount": item_total_amount
        })

    # --- 4. PAYMENT & CREDIT LOGIC ---
    amount_paid = sale_data.amountPaid if sale_data.amountPaid is not None else total_sale_amount
    balance = total_sale_amount - amount_paid
    
    credit_status = "Unpaid"
    if balance == 0:
        credit_status = "Paid"
    elif balance < total_sale_amount:
        credit_status = "Partial"


    # Create the final sale record
    sale_ref = sales_collection.document()
    sale_record = {
        "customerName": sale_data.customerName,
        "phoneNumber": sale_data.phoneNumber,
        "paymentMethod": sale_data.paymentMethod,
        "items": processed_items,
        "totalAmount": total_sale_amount,
        "amountPaid": amount_paid,
        "balance": balance,
        "creditStatus": credit_status,
        "date": datetime.now().isoformat()
    }
    
    # ADD: Include installment_info if provided
    if sale_data.installment_info:
        sale_record["installment_info"] = sale_data.installment_info.model_dump()
    
    transaction.set(sale_ref, sale_record)

    # --- 5. CREATE CREDIT RECORD IF THERE'S A BALANCE ---
    if balance > 0:
        credit_record = CreditRecordCreate(
            saleId=sale_ref.id,
            customerName=sale_data.customerName,
            phoneNumber=sale_data.phoneNumber,
            totalAmount=total_sale_amount,
            amountPaid=amount_paid,
            balance=balance,
        )
        credit_ref = credit_collection.document(sale_ref.id) # Use saleId as document ID for easy lookup
        credit_data = credit_record.model_dump()
        credit_data["date"] = datetime.now().isoformat()
        transaction.set(credit_ref, credit_data)

    return {"id": sale_ref.id, **sale_record}


def create_sale(sale_data: SaleCreate):
    """Public function to initiate the sale transaction."""
    transaction = db.transaction()
    return process_sale_transaction(transaction, sale_data)

def get_sale(sale_id: str):
    """Retrieves a single sale by its ID."""
    doc = sales_collection.document(sale_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None

def get_all_sales():
    """Retrieves all sales."""
    sales = []
    docs = sales_collection.stream()
    for doc in docs:
        sales.append({"id": doc.id, **doc.to_dict()})
    return sales

def get_sales_by_date(date: str):
    """Retrieves all sales for a specific date and calculates the total."""
    sales = []
    total = 0.0
    
    start_of_day = date + "T00:00:00"
    end_of_day = date + "T23:59:59.999999"
    
    docs = sales_collection.where(
        filter=FieldFilter("date", ">=", start_of_day)
    ).where(
        filter=FieldFilter("date", "<=", end_of_day)
    ).stream()

    for doc in docs:
        sale_data = doc.to_dict()
        sales.append({"id": doc.id, **sale_data})
        total += sale_data.get("totalAmount", 0.0)
        
    return {"sales": sales, "total_sales": total}

def update_sale(sale_id: str, sale_update: SaleUpdate):
    """Updates a sale's customer-related information."""
    sale_ref = sales_collection.document(sale_id)
    update_data = sale_update.model_dump(exclude_unset=True)
    
    if not update_data:
        return None

    sale_ref.update(update_data)
    return {"id": sale_id, **update_data}

@firestore.transactional
def delete_sale_transaction(transaction, sale_id: str):
    """Deletes a sale and restores all sold item quantities to the inventory."""
    sale_ref = sales_collection.document(sale_id)
    sale_snapshot = sale_ref.get(transaction=transaction)

    if not sale_snapshot.exists:
        raise ValueError("Sale not found.")

    sale_data = sale_snapshot.to_dict()
    items_in_sale = sale_data.get("items", [])
    
    item_refs_and_quantities = []

    # --- 1. READ PHASE ---
    for item_sold in items_in_sale:
        item_id = item_sold.get("itemId")
        if item_id:
            item_ref = inventory_collection.document(item_id)
            item_snapshot = item_ref.get(transaction=transaction)
            if item_snapshot.exists:
                item_refs_and_quantities.append((item_ref, item_snapshot.to_dict(), item_sold.get("quantitySold", 0)))

    # --- 2. WRITE PHASE ---
    for item_ref, item_data, quantity_sold in item_refs_and_quantities:
        current_quantity = item_data.get('quantity', 0)
        new_quantity = current_quantity + quantity_sold
        transaction.update(item_ref, {'quantity': new_quantity})

    transaction.delete(sale_ref)
    
    # --- 3. DELETE CREDIT RECORD ---
    credit_ref = credit_collection.document(sale_id)
    transaction.delete(credit_ref)


def delete_sale(sale_id: str):
    """Public function to initiate the sale deletion transaction."""
    transaction = db.transaction()
    try:
        delete_sale_transaction(transaction, sale_id)
        return {"status": "success", "message": f"Sale {sale_id} deleted and inventory restored."}
    except ValueError:
        return None