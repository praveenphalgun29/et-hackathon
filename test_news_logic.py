import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_specific_query(user_query):
    api_key = os.getenv("NEWSDATA_API_KEY")
    url = "https://newsdata.io/api/1/news"
    
    # STRATEGY: We convert conversational questions into "Keywords"
    # AI APIs hate "What is happening in..." they love "Indian Stock Market"
    keywords = user_query.replace("What is happening in ", "").replace("?", "")
    
    params = {
        'apikey': api_key,
        'q': keywords,
        'country': 'in',
        'category': 'business',
        'language': 'en'
    }

    print(f"\n--- Testing Query: '{keywords}' ---")
    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") == "success":
        results = data.get("results", [])
        print(f"Total Results Found: {len(results)}")
        
        if len(results) > 0:
            for i, art in enumerate(results[:2]): # Show top 2
                print(f"\n[Article {i+1}]")
                print(f"Title: {art.get('title')}")
                print(f"Description: {art.get('description')[:100]}...")
        else:
            print("❌ ZERO results found for this specific keyword on the free tier.")
    else:
        print(f"❌ API Error: {data.get('results', {}).get('message')}")

if __name__ == "__main__":
    # TEST 1: The specific one that failed
    test_specific_query("Indian stock market")
    
    # TEST 2: Another specific one
    test_specific_query("Reliance Industries")
    
    # TEST 3: The one you really want
    #test_specific_query("Zomato")