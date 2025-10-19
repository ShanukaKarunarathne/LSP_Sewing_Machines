# app/db/firebase_config.py
import firebase_admin
from firebase_admin import credentials, firestore
from app.core import config
import os
import logging

# Suppress gRPC ALTS warnings
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_POLL_STRATEGY'] = 'poll'

# Suppress ALTS credentials warning
logging.getLogger('google.auth.transport.grpc').setLevel(logging.ERROR)

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
credit_collection = db.collection('credit')