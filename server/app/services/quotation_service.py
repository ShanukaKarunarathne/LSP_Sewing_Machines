from datetime import datetime
from typing import Any, Dict, List, Optional

from app.db.firebase_config import inventory_collection, quotations_collection
from app.schemas.quotation import QuotationCreate


def _get_inventory_item(item_id: str):
    doc = inventory_collection.document(item_id).get()
    if not doc.exists:
        raise ValueError(f"Inventory item with ID {item_id} not found.")
    return doc.to_dict()


def create_quotation(quotation_data: QuotationCreate) -> Dict[str, Any]:
    """
    Prepare a quotation for a potential sale without mutating inventory.
    """
    processed_items: List[Dict[str, Any]] = []
    total_amount = 0.0

    for requested_item in quotation_data.items:
        item_data = _get_inventory_item(requested_item.itemId)
        price_per_item = (
            requested_item.sellingPrice
            if requested_item.sellingPrice is not None
            else item_data.get("sellingPrice")
        )

        if price_per_item is None:
            raise ValueError(f"Selling price missing for inventory item {item_data.get('itemName', requested_item.itemId)}.")

        quantity_requested = requested_item.quantityRequested
        item_total = price_per_item * quantity_requested
        total_amount += item_total

        processed_items.append(
            {
                "itemId": requested_item.itemId,
                "itemName": item_data.get("itemName"),
                "modelNumber": item_data.get("modelNumber"),
                "quantityRequested": quantity_requested,
                "pricePerItem": price_per_item,
                "totalAmount": item_total,
                "availableQuantity": item_data.get("quantity", 0),
            }
        )

    old_item_deduction = None
    if quotation_data.old_item_exchange:
        old_item_deduction = quotation_data.old_item_exchange.deduction_amount
        total_amount -= old_item_deduction

    borrowed_items_profit = None
    if quotation_data.borrowed_items:
        borrowed_items_profit = 0.0
        for borrowed in quotation_data.borrowed_items:
            total_amount += borrowed.selling_price * borrowed.quantity
            borrowed_items_profit += (borrowed.selling_price - borrowed.borrowed_cost) * borrowed.quantity

    quotation_ref = quotations_collection.document()
    quotation_record: Dict[str, Any] = {
        "customerName": quotation_data.customerName,
        "phoneNumber": quotation_data.phoneNumber,
        "items": processed_items,
        "totalAmount": total_amount,
        "notes": quotation_data.notes,
        "date": datetime.now().isoformat(),
    }

    if quotation_data.installment_info:
        quotation_record["installment_info"] = quotation_data.installment_info.model_dump()

    if quotation_data.old_item_exchange:
        quotation_record["old_item_exchange"] = quotation_data.old_item_exchange.model_dump()
        quotation_record["old_item_deduction"] = old_item_deduction

    if quotation_data.borrowed_items:
        quotation_record["borrowed_items"] = [item.model_dump() for item in quotation_data.borrowed_items]
        quotation_record["borrowed_items_profit"] = borrowed_items_profit

    quotation_ref.set(quotation_record)

    return {"id": quotation_ref.id, **quotation_record}


def get_quotation(quotation_id: str) -> Optional[Dict[str, Any]]:
    doc = quotations_collection.document(quotation_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None


def get_all_quotations() -> List[Dict[str, Any]]:
    quotations: List[Dict[str, Any]] = []
    docs = quotations_collection.stream()
    for doc in docs:
        quotations.append({"id": doc.id, **doc.to_dict()})
    return quotations
