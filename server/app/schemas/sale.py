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
    due_dates: Optional[List[str]] = None

# New schema for old item exchange
class OldItemExchange(BaseModel):
    description: str
    deduction_amount: float

# New schema for borrowed item
class BorrowedItem(BaseModel):
    description: str
    borrowed_cost: float  # Cost paid to neighbor
    selling_price: float  # Price sold to customer
    quantity: int = 1

class SaleCreate(SaleBase):
    items: List[SaleItem]
    amountPaid: Optional[float] = None
    installment_info: Optional[InstallmentInfo] = None
    old_item_exchange: Optional[OldItemExchange] = None
    borrowed_items: Optional[List[BorrowedItem]] = None

class SaleUpdate(BaseModel):
    customerName: Optional[str] = None
    phoneNumber: Optional[str] = None
    paymentMethod: Optional[str] = None

class SaleItemInDB(SaleItem):
    itemName: str
    modelNumber: str
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
    installment_info: Optional[InstallmentInfo] = None
    old_item_exchange: Optional[OldItemExchange] = None
    borrowed_items: Optional[List[BorrowedItem]] = None
    old_item_deduction: Optional[float] = None
    borrowed_items_profit: Optional[float] = None

class SalesByDateResponse(BaseModel):
    sales: List[SaleInDB]
    total_sales: float