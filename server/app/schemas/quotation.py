from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.sale import (
    BorrowedItem,
    InstallmentInfo,
    OldItemExchange,
)


class QuotationItem(BaseModel):
    itemId: str
    quantityRequested: int = Field(..., gt=0)
    sellingPrice: Optional[float] = None


class QuotationCreate(BaseModel):
    customerName: str
    phoneNumber: Optional[str] = None
    items: List[QuotationItem]
    notes: Optional[str] = None
    installment_info: Optional[InstallmentInfo] = None
    old_item_exchange: Optional[OldItemExchange] = None
    borrowed_items: Optional[List[BorrowedItem]] = None


class QuotationItemInDB(BaseModel):
    itemId: str
    itemName: str
    modelNumber: str
    quantityRequested: int
    pricePerItem: float
    totalAmount: float
    availableQuantity: int


class QuotationInDB(QuotationCreate):
    id: str
    date: str
    totalAmount: float
    items: List[QuotationItemInDB]
    old_item_deduction: Optional[float] = None
    borrowed_items_profit: Optional[float] = None
