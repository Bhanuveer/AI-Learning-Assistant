from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

MONGODB_URL = os.getenv(
    "MONGODB_URL"
)

DATABASE_NAME = os.getenv(
    "DATABASE_NAME"
)

client = MongoClient(
    MONGODB_URL,
    tlsCAFile=certifi.where()
)

db = client[DATABASE_NAME]