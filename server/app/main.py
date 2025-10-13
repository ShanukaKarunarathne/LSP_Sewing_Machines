# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import inventory, sales, expenses, credit, users
import os
from datetime import datetime

app = FastAPI(title="LSP Sewing Machines POS API")

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Include the API routers ---
# User routes (no authentication required for login, but required for other routes)
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

# Other routes (authentication will be added as needed)
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["Expenses"])
app.include_router(credit.router, prefix="/api/v1", tags=["Credit"])