from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.schemas.quotation import QuotationCreate, QuotationInDB
from app.services import quotation_service

router = APIRouter()


@router.post("/", response_model=QuotationInDB, status_code=status.HTTP_201_CREATED)
def create_new_quotation(
    quotation: QuotationCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Record a quotation without modifying inventory stock levels.
    """
    try:
        new_quotation = quotation_service.create_quotation(quotation)
        return new_quotation
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/{quotation_id}", response_model=QuotationInDB)
def read_quotation(
    quotation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve a single quotation by ID.
    """
    quotation = quotation_service.get_quotation(quotation_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    return quotation


@router.get("/", response_model=List[QuotationInDB])
def read_all_quotations(
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve all quotations.
    """
    quotations = quotation_service.get_all_quotations()
    return quotations
