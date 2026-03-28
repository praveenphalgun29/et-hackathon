import sys
import os
import uuid
import requests
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.pinecone_service import PineconeService
from dotenv import load_dotenv

load_dotenv()

def fetch_and_store_news():
    mock_data = [
        {
            "title": "Reliance Industries expands Green Energy footprint",
            "content": "Reliance announces a new solar plant in Gujarat...",
            "date": "2026-03-25",
            "category": "Energy",
            "entities": ["Reliance", "Ambani"],
            "sentiment": 0.8
        },
        {
            "title": "Adani Group enters Solar JV",
            "content": "A direct competition to Reliance's solar ambitions...",
            "date": "2026-03-26",
            "category": "Energy",
            "entities": ["Adani", "Reliance"],
            "sentiment": 0.4
        }
    ]
    
    ps = PineconeService()
    items_to_upsert = []
    
    for article in mock_data:
        items_to_upsert.append({
            "id": str(uuid.uuid4()),
            "text": f"{article['title']}. {article['content']}",
            "metadata": {
                "title": article['title'],
                "date": article['date'],
                "category": article['category'],
                "entities": article['entities'],
                "sentiment": article['sentiment'],
                "source": "Economic Times (Simulated)"
            }
        })
    
    ps.upsert_news(items_to_upsert)
    print(f"Successfully ingested {len(items_to_upsert)} articles.")

if __name__ == "__main__":
    fetch_and_store_news()