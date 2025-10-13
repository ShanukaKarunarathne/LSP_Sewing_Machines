# app/api/v1/endpoints/sales.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.schemas.sale import SaleCreate, SaleInDB, SaleUpdate, SalesByDateResponse
from app.services import sale_service
from app.core.security import get_current_user, require_l2_permission

router = APIRouter()

@router.post("/", response_model=SaleInDB, status_code=status.HTTP_201_CREATED)
def create_new_sale(
    sale: SaleCreate,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can create
):
    """
    Record a new sale. This will decrease the corresponding inventory stock.
    L1 and L2 users can create sales.
    """
    try:
        new_sale = sale_service.create_sale(sale)
        return new_sale
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{sale_id}", response_model=SaleInDB)
def read_sale(
    sale_id: str,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve a single sale by ID.
    L1 and L2 users can read sales.
    """
    sale = sale_service.get_sale(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.get("/", response_model=List[SaleInDB])
def read_all_sales(
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve all sales.
    L1 and L2 users can read sales.
    """
    sales = sale_service.get_all_sales()
    return sales

@router.get("/by_date/{date}", response_model=SalesByDateResponse)
def read_sales_by_date(
    date: str,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can read
):
    """
    Retrieve all sales for a specific date (YYYY-MM-DD) and the total for that day.
    L1 and L2 users can read sales.
    """
    result = sale_service.get_sales_by_date(date)
    return result

@router.put("/{sale_id}", response_model=SaleInDB)
def update_existing_sale(
    sale_id: str,
    sale: SaleUpdate,
    current_user: dict = Depends(require_l2_permission)  # Only L2 can update
):
    """
    Update a sale.
    Only L2 users can update sales.
    """
    updated_sale = sale_service.update_sale(sale_id, sale)
    if not updated_sale:
        raise HTTPException(status_code=404, detail="Sale not found or no new data provided")
    return read_sale(sale_id)

@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_sale(
    sale_id: str,
    current_user: dict = Depends(require_l2_permission)  # Only L2 can delete
):
    """
    Delete a sale.
    Only L2 users can delete sales.
    """
    result = sale_service.delete_sale(sale_id)
    if not result:
        raise HTTPException(status_code=404, detail="Sale not found")
    return None