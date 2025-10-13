# app/api/v1/endpoints/inventory.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Union
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryInDB, InventoryAction
from app.services import inventory_service
from app.core.security import get_current_user, require_l2_permission

router = APIRouter()

@router.post("/manage", response_model=Union[InventoryInDB, List[InventoryInDB], None])
def manage_inventory(
    request: InventoryAction,
    current_user: dict = Depends(get_current_user)  # L1 and L2 can access
):
    """
    Manage inventory items with a single endpoint.
    - `action`: "create", "update", "delete", "read"
    - `payload`: The data for the action.
    
    L1 users: Can CREATE and READ only
    L2 users: Can CREATE, READ, UPDATE, and DELETE (Full CRUD)
    """
    action = request.action
    payload = request.payload
    
    # Check permissions for UPDATE and DELETE operations
    if action in ["update", "delete"]:
        if current_user["level"] != "L2":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action. L2 access required for update/delete operations."
            )

    if action == "create":
        item = InventoryCreate(**payload)
        new_item = inventory_service.create_item(item)
        return new_item

    elif action == "read":
        if "item_id" in payload:
            item = inventory_service.get_item(payload["item_id"])
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return item
        else:
            items = inventory_service.get_all_items()
            return items

    elif action == "update":
        if "item_id" not in payload:
            raise HTTPException(status_code=400, detail="Item ID is required for update")
        item_id = payload.pop("item_id")
        item = InventoryUpdate(**payload)
        updated_item = inventory_service.update_item(item_id, item)
        if not updated_item:
            raise HTTPException(status_code=404, detail="Item not found")
        return updated_item

    elif action == "delete":
        if "item_id" not in payload:
            raise HTTPException(status_code=400, detail="Item ID is required for delete")
        result = inventory_service.delete_item(payload["item_id"])
        if not result:
            raise HTTPException(status_code=404, detail="Item not found")
        return None

    else:
        raise HTTPException(status_code=400, detail="Invalid action")