import os
import time
import asyncio
import requests
import uuid
from datetime import datetime
from app.services.pinecone_service import PineconeService


class NewsApiService:
    def __init__(self):
        self.api_key = os.getenv("NEWSDATA_API_KEY")
        self.base_url = "https://newsdata.io/api/1/news"
        self.ps = PineconeService()
        self.is_unauthorized = False
        self._check_key_at_startup()

    def _check_key_at_startup(self):
        """Validate API key once on startup to avoid request-time hangs."""
        print(f"[NEWS API] Validating NEWSDATA_API_KEY...")
        try:
            # Simple minimal request to check auth
            res = requests.get(self.base_url, params={'apikey': self.api_key, 'q': 'test'}, timeout=5)
            if res.status_code == 401:
                print("[NEWS API] !!! STARTUP ERROR: API KEY IS UNAUTHORIZED (401). NITRO MODE ENABLED !!!")
                self.is_unauthorized = True
            else:
                print(f"[NEWS API] Startup check passed (Status: {res.status_code})")
        except Exception as e:
            print(f"[NEWS API] Startup check failed (Network?): {e}")
            # Don't set is_unauthorized here, might be a temporary network blip

    def _build_keyword_ladder(self, keywords: str) -> list:
        """
        Smart ladder: full phrase → shrink from right → tail subphrases → individual words
        "sebi margin rules" → ["sebi margin rules", "sebi margin", "sebi",
                               "margin rules", "rules", "margin"]
        """
        words = keywords.strip().split()
        ladder = []

        # Strategy 1: Shrink from right
        for i in range(len(words), 0, -1):
            phrase = " ".join(words[:i])
            if phrase not in ladder:
                ladder.append(phrase)

        # Strategy 2: Tail subphrases
        if len(words) > 1:
            for start in range(1, len(words)):
                phrase = " ".join(words[start:])
                if phrase not in ladder:
                    ladder.append(phrase)

        # Strategy 3: Individual words by length (longer = more specific)
        for word in sorted(words, key=len, reverse=True):
            if word not in ladder and len(word) > 2:
                ladder.append(word)

        return ladder

    def _fetch_from_api(self, keywords: str) -> list:
        """
        Fetches news from the NewsData API with fail-fast for 401.
        """
        if self.is_unauthorized:
            return []

        params = {
            'apikey': self.api_key,
            'q': keywords,
            'country': 'in',
            'category': 'business',
            'language': 'en'
        }

        for i in range(2):
            try:
                response = requests.get(self.base_url, params=params, timeout=5) # Reduced timeout
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success":
                        results = data.get('results', [])
                        return [r for r in results if r.get('title') and (r.get('description') or r.get('content'))]
                elif response.status_code == 429:
                    print(f"[NEWS API] RATE LIMITED (429). Enabling Global Fail-Fast.")
                    self.is_unauthorized = True
                    return []
                else:
                    print(f"[NEWS API] Error {response.status_code} for '{keywords}'")
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"[NEWS API] Network error on attempt {i+1} for '{keywords}': {e}")
                time.sleep(0.5)
            except Exception as e:
                print(f"[ERROR] API call failed for '{keywords}': {e}")
                return []
        return []

    async def fetch_et_news(self, keywords: str = "business"):
        """
        Fetches Indian business news using a keyword ladder fallback.
        Tags all articles with original keyword as Pinecone topic.
        """
        original_keywords = keywords.lower().strip()
        ladder = self._build_keyword_ladder(original_keywords)

        articles = []

        # Run the sync ladder in a thread to avoid blocking the event loop
        def sync_fetch():
            for attempt in ladder:
                print(f"[NEWS API] Trying: '{attempt}'")
                res = self._fetch_from_api(attempt)
                if res:
                    print(f"[NEWS API] Success: {len(res)} articles for '{attempt}'")
                    return res
                print(f"[NEWS API] 0 results, trying next...")
            return []

        articles = await asyncio.to_thread(sync_fetch)

        if not articles:
            print(f"[NEWS API] All primary attempts exhausted for '{original_keywords}'. Trying global fallback...")
            articles = await asyncio.to_thread(self._fetch_from_api, "Indian business news")
            
        if not articles:
            print(f"[NEWS API] !!! UNIVERSAL FAILURE for '{original_keywords}'. USING STATIC FALLBACK !!!")
            articles = self._get_static_fallback_news(original_keywords)

        # Build upsert items
        items_to_upsert = []
        for art in articles:
            description = art.get('description', '')[:300]
            content = art.get('content', '') or description
            text_content = f"{art.get('title', '')}. {description}. {content[:400]}"

            items_to_upsert.append({
                "id": str(uuid.uuid4()),
                "text": text_content,
                "metadata": {
                    "title": art.get('title') or '',
                    "description": description or '',
                    "date": (art.get('pubDate') or datetime.now().strftime('%Y-%m-%d'))[:10],
                    "pubDate": (art.get('pubDate') or datetime.now().strftime('%Y-%m-%d'))[:10],
                    "category": "Business",
                    "source": art.get('source_id') or 'The Economic Times',
                    "url": art.get('link', ''),
                    "image_url": art.get('image_url', ''),
                    "is_mock": art.get('is_mock', False)
                }
            })

        print(f"[INFO] Prepared {len(items_to_upsert)} articles for synthesis.")
        return items_to_upsert

    def _get_static_fallback_news(self, topic: str):
        """High-quality static news for demo stability."""
        return [
            {
                "title": f"{topic.title()} Analysis: Market Dynamics in focus",
                "description": f"Latest developments in {topic} show a shift in investor sentiment as global trends impact Indian markets. Experts suggest a cautious approach with focus on long-term value.",
                "content": f"The Indian markets are closely monitoring {topic} after recent policy shifts. Benchmark indices have seen volatility, but structural reforms continue to provide a floor. Analysts at ET Intelligence expect this trend to persist through the quarter.",
                "pubDate": datetime.now().strftime('%Y-%m-%d'),
                "source_id": "Economic Times Intelligence",
                "link": "https://economictimes.indiatimes.com",
                "is_mock": True
            },
            {
                "title": f"The {topic} Story: What every {topic} followers needs to know today",
                "description": f"A deep dive into the current state of {topic} in the Indian context, highlighting regulatory changes and corporate earnings impact.",
                "content": f"The {topic} segment is undergoing rapid transformation. From SEBI's new rules to FII flows, every factor is contributing to a new market narrative. This analysis covers the key pivots observed this week.",
                "pubDate": datetime.now().strftime('%Y-%m-%d'),
                "source_id": "ET Prime Insights",
                "link": "https://economictimes.indiatimes.com/prime",
                "is_mock": True
            }
        ]