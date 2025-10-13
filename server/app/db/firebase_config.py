# app/db/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore
from app.core import config

# This check prevents re-initializing the app in --reload mode
if not firebase_admin._apps:
    cred = credentials.Certificate(config.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Collections
inventory_collection = db.collection('inventory')
sales_collection = db.collection('sales')
expenses_collection = db.collection('expenses')
credit_payments_collection = db.collection('credit_payments')
credit_collection = db.collection('credit') # Add this line