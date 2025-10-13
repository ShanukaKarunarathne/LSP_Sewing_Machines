# app/schemas/inventory.py
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any

class InventoryBase(BaseModel):
    itemName: str
    modelNumber: str
    quantity: int
    purchasePrice: float
    sellingPrice: float

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    itemName: Optional[str] = None
    modelNumber: Optional[str] = None
    quantity: Optional[int] = None
    purchasePrice: Optional[float] = None
    sellingPrice: Optional[float] = None

class InventoryInDB(InventoryBase):
    id: str
    expenseId: Optional[str] = None

class InventoryAction(BaseModel):
    action: Literal["create", "update", "delete", "read"]
    payload: Dict[str, Any]