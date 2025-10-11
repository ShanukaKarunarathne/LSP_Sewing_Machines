# app/api/v1/endpoints/credit.py
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.credit import CreditPaymentCreate, CreditPaymentInDB, CreditRecordInDB
from app.services import credit_service

router = APIRouter()

@router.post("/credit/", response_model=CreditPaymentInDB, status_code=status.HTTP_201_CREATED)
def record_credit_payment(payment: CreditPaymentCreate):
    """
    Record a payment towards a credit sale.
    Customers can make multiple partial payments (e.g., 10 + 50 + 40 = 100).
    """
    try:
        new_payment = credit_service.create_credit_payment(payment)
        return new_payment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/credit/payment/{payment_id}", status_code=status.HTTP_200_OK)
def delete_credit_payment(payment_id: str):
    """
    Delete a credit payment (for when workers make mistakes).
    This will restore the balance in the sale and credit records.
    """
    try:
        result = credit_service.delete_credit_payment(payment_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/credit/all", response_model=List[CreditRecordInDB])
def get_all_credit_records():
    """
    Get all active credit records (customers who still owe money).
    """
    credits = credit_service.get_all_credit_records()
    return credits


@router.get("/credit/{sale_id}", response_model=List[CreditPaymentInDB])
def get_payments_for_sale(sale_id: str):
    """
    Get all credit payments for a specific sale.
    Shows the full payment history (e.g., 10, then 50, then 40).
    """
    payments = credit_service.get_credit_payments_for_sale(sale_id)
    return payments


@router.get("/credit/record/{sale_id}", response_model=CreditRecordInDB)
def get_credit_record(sale_id: str):
    """
    Get the current credit record for a specific sale.
    Shows current balance and total amount paid.
    """
    record = credit_service.get_credit_record(sale_id)
    if not record:
        raise HTTPException(status_code=404, detail="Credit record not found")
    return record