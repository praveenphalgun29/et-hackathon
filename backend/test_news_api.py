import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_api():
    api_key = os.getenv("NEWSDATA_API_KEY")
    url = "https://newsdata.io/api/1/news"
    
    # We are broadening the search:
    # 1. We search for "Economic Times" in the query 'q'
    # 2. We keep country='in' and category='business'
    # 3. We REMOVE the problematic 'domain' filter for now
    params = {
        'apikey': api_key,
        'q': 'Economic Times', 
        'country': 'in',
        'category': 'business'
    }

    print(f"Testing NewsData.io with query: {params['q']}...")
    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") == "success":
        articles = data.get("results", [])
        print(f"✅ SUCCESS! Found {len(articles)} articles.")
        for i, art in enumerate(articles[:3]):
            print(f"\nArticle {i+1}: {art.get('title')}")
            print(f"Source: {art.get('source_id')}")
    else:
        print(f"❌ API ERROR: {data.get('results', {}).get('message')}")

if __name__ == "__main__":
    test_api()