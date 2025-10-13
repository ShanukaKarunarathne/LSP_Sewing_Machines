# app/schemas/sale.py
from pydantic import BaseModel, Field
from typing import Optional, List

class SaleItem(BaseModel):
    itemId: str
    quantitySold: int
    sellingPrice: Optional[float] = None

class SaleBase(BaseModel):
    customerName: str
    phoneNumber: str
    paymentMethod: str

# New schema for installment information
class InstallmentInfo(BaseModel):
    has_plan: bool = False
    number_of_installments: Optional[int] = None
    due_dates: Optional[List[str]] = None # List of due dates in "YYYY-MM-DD" format

class SaleCreate(SaleBase):
    items: List[SaleItem]
    amountPaid: Optional[float] = None
    installment_info: Optional[InstallmentInfo] = None # Add this line

class SaleUpdate(BaseModel):
    customerName: Optional[str] = None
    phoneNumber: Optional[str] = None
    paymentMethod: Optional[str] = None

class SaleItemInDB(SaleItem):
    pricePerItem: float
    totalAmount: float

class SaleInDB(SaleBase):
    id: str
    date: str
    items: List[SaleItemInDB]
    totalAmount: float
    amountPaid: float
    balance: float
    creditStatus: str
    installment_info: Optional[InstallmentInfo] = None # Add this line

class SalesByDateResponse(BaseModel):
    sales: List[SaleInDB]
    total_sales: float