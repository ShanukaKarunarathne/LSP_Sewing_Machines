# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.v1.endpoints import inventory, sales, expenses, credit
import os
from datetime import datetime

app = FastAPI(title="LSP Sewing Machines POS API")

# Health check endpoint
@app.get("/")
async def health_check():
    """
    Health check endpoint to verify the API is running
    """
    return {
        "status": "healthy",
        "message": "LSP Sewing Machines POS API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# --- Define project directories ---
# This makes your paths more robust and easier to manage.

# Base directory is the root of your project (where the 'app' folder is)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Include the API routers ---
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["Expenses"])
app.include_router(credit.router, prefix="/api/v1", tags=["Credit"])

