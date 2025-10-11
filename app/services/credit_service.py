# app/services/credit_service.py
from datetime import datetime
from firebase_admin import firestore
from app.db.firebase_config import db, sales_collection, credit_payments_collection, credit_collection
from app.schemas.credit import CreditPaymentCreate

@firestore.transactional
def create_credit_payment_transaction(transaction, payment_data: CreditPaymentCreate):
    """Records a credit payment and updates the corresponding sale and credit records."""
    sale_ref = sales_collection.document(payment_data.saleId)
    sale_snapshot = sale_ref.get(transaction=transaction)

    if not sale_snapshot.exists:
        raise ValueError("Sale not found")

    sale_data = sale_snapshot.to_dict()
    
    # --- 1. VALIDATION ---
    if sale_data['balance'] <= 0:
        raise ValueError("This sale has no outstanding balance.")
    if payment_data.amount <= 0:
        raise ValueError("Payment amount must be greater than zero.")
    if payment_data.amount > sale_data['balance']:
        raise ValueError("Payment amount cannot be greater than the outstanding balance.")

    # --- 2. READ CREDIT RECORD FIRST (before any writes) ---
    credit_ref = credit_collection.document(payment_data.saleId)
    credit_snapshot = credit_ref.get(transaction=transaction)

    # --- 3. CALCULATE NEW VALUES ---
    new_balance = sale_data['balance'] - payment_data.amount
    new_amount_paid = sale_data['amountPaid'] + payment_data.amount
    
    new_credit_status = "Partial"
    if new_balance == 0:
        new_credit_status = "Paid"

    # --- 4. UPDATE SALE ---
    transaction.update(sale_ref, {
        "balance": new_balance,
        "amountPaid": new_amount_paid,
        "creditStatus": new_credit_status
    })

    # --- 5. UPDATE CREDIT RECORD ---
    if new_balance == 0:
        # Mark as completed instead of deleting
        transaction.update(credit_ref, {
            "balance": 0,
            "amountPaid": new_amount_paid,
            "status": "Completed"
        })
    else:
        # Update or create credit record
        if credit_snapshot.exists:
            transaction.update(credit_ref, {
                "balance": new_balance,
                "amountPaid": new_amount_paid
            })
        else:
            # Create credit record if it doesn't exist
            credit_data = {
                "saleId": payment_data.saleId,
                "customerName": sale_data.get("customerName", ""),
                "phoneNumber": sale_data.get("phoneNumber", ""),
                "totalAmount": sale_data['totalAmount'],
                "amountPaid": new_amount_paid,
                "balance": new_balance,
                "date": datetime.now().isoformat(),
                "status": "Active"
            }
            transaction.set(credit_ref, credit_data)

    # --- 6. CREATE PAYMENT RECORD ---
    payment_ref = credit_payments_collection.document()
    payment_record = payment_data.model_dump()
    payment_record["date"] = datetime.now().isoformat()
    
    transaction.set(payment_ref, payment_record)

    return {"id": payment_ref.id, **payment_record}

def create_credit_payment(payment_data: CreditPaymentCreate):
    """Public function to initiate the credit payment transaction."""
    transaction = db.transaction()
    return create_credit_payment_transaction(transaction, payment_data)


@firestore.transactional
def delete_credit_payment_transaction(transaction, payment_id: str):
    """Deletes a credit payment and reverses the sale/credit record updates."""
    
    # 1. READ PAYMENT RECORD FIRST
    payment_ref = credit_payments_collection.document(payment_id)
    payment_snapshot = payment_ref.get(transaction=transaction)
    
    if not payment_snapshot.exists:
        raise ValueError("Payment not found")
    
    payment_data = payment_snapshot.to_dict()
    sale_id = payment_data['saleId']
    payment_amount = payment_data['amount']
    
    # 2. READ SALE RECORD
    sale_ref = sales_collection.document(sale_id)
    sale_snapshot = sale_ref.get(transaction=transaction)
    
    if not sale_snapshot.exists:
        raise ValueError("Associated sale not found")
    
    sale_data = sale_snapshot.to_dict()
    
    # 3. READ CREDIT RECORD
    credit_ref = credit_collection.document(sale_id)
    credit_snapshot = credit_ref.get(transaction=transaction)
    
    # 4. CALCULATE NEW VALUES
    new_balance = sale_data['balance'] + payment_amount
    new_amount_paid = sale_data['amountPaid'] - payment_amount
    
    new_credit_status = "Unpaid"
    if new_amount_paid > 0:
        new_credit_status = "Partial"
    if new_balance == 0:
        new_credit_status = "Paid"
    
    # 5. UPDATE SALE
    transaction.update(sale_ref, {
        "balance": new_balance,
        "amountPaid": new_amount_paid,
        "creditStatus": new_credit_status
    })
    
    # 6. UPDATE CREDIT RECORD
    if credit_snapshot.exists:
        transaction.update(credit_ref, {
            "balance": new_balance,
            "amountPaid": new_amount_paid,
            "status": "Active" if new_balance > 0 else "Completed"
        })
    else:
        # Recreate credit record if it was deleted
        credit_data = {
            "saleId": sale_id,
            "customerName": sale_data.get("customerName", ""),
            "phoneNumber": sale_data.get("phoneNumber", ""),
            "totalAmount": sale_data['totalAmount'],
            "amountPaid": new_amount_paid,
            "balance": new_balance,
            "date": datetime.now().isoformat(),
            "status": "Active"
        }
        transaction.set(credit_ref, credit_data)
    
    # 7. DELETE PAYMENT RECORD
    transaction.delete(payment_ref)
    
    return {"status": "success", "message": f"Payment {payment_id} deleted and balance restored."}


def delete_credit_payment(payment_id: str):
    """Public function to initiate the credit payment deletion transaction."""
    transaction = db.transaction()
    return delete_credit_payment_transaction(transaction, payment_id)


def get_credit_payments_for_sale(sale_id: str):
    """Retrieves all credit payments for a specific sale."""
    payments = []
    docs = credit_payments_collection.where("saleId", "==", sale_id).stream()
    for doc in docs:
        payments.append({"id": doc.id, **doc.to_dict()})
    return payments


def get_all_credit_records():
    """Retrieves all active credit records."""
    credits = []
    docs = credit_collection.stream()
    for doc in docs:
        credit_data = doc.to_dict()
        # Only return active credits (balance > 0)
        if credit_data.get('balance', 0) > 0:
            credits.append({"id": doc.id, **credit_data})
    return credits


def get_credit_record(sale_id: str):
    """Retrieves a specific credit record by sale ID."""
    doc = credit_collection.document(sale_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None