from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["portfolio_db"]
settings = db["settings"]

new_map_url = "https://maps.google.com/maps?width=600&height=400&hl=en&q=rijal%20food%20and%20beverage&t=&z=14&ie=UTF8&iwloc=B&output=embed"

result = settings.update_one(
    {"type": "admin_credentials"},
    {"$set": {"map_url": new_map_url}}
)

print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
w