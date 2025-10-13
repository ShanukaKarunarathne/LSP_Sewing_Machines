# app/schemas/credit.py
from pydantic import BaseModel
from typing import Optional

class CreditPaymentCreate(BaseModel):
    saleId: str
    amount: float
    paymentMethod: str # e.g., "Cash", "Card", "Cheque"
    description: Optional[str] = None  # ADD: Description for the payment
    chequeNumber: Optional[str] = None
    chequeDate: Optional[str] = None

class CreditPaymentInDB(CreditPaymentCreate):
    id: str
    date: str

class CreditRecordCreate(BaseModel):
    saleId: str
    customerName: str
    phoneNumber: str
    totalAmount: float
    amountPaid: float
    balance: float

class CreditRecordInDB(CreditRecordCreate):
    id: str
    date: str