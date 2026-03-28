import os
import time
import requests
import uuid
from datetime import datetime
from app.services.pinecone_service import PineconeService


class NewsApiService:
    def __init__(self):
        self.api_key = os.getenv("NEWSDATA_API_KEY")
        # Back to /news — this is what actually works on the free tier
        self.base_url = "https://newsdata.io/api/1/news"
        self.ps = PineconeService()

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
        Simple, proven API call — exactly what worked in test_news_logic.py.
        Only 4 parameters: apikey, q, country, category, language.
        No prioritydomain, no datatype, no domainurl, no full_content.
        These caused silent 0-result failures on the free tier.
        """
        params = {
            'apikey': self.api_key,
            'q': keywords,
            'country': 'in',
            'category': 'business',
            'language': 'en'
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()

            if data.get("status") == "success" and data.get("results"):
                articles = data["results"]
                # Keep only articles with title AND description
                articles = [
                    a for a in articles
                    if a.get('title') and a.get('description')
                ]
                print(f"[NEWS API] Got {len(articles)} valid articles for '{keywords}'")
                return articles

            # Log API errors clearly
            if data.get("status") != "success":
                print(f"[NEWS API] API error for '{keywords}': {data.get('results', {})}")
            return []

        except Exception as e:
            print(f"[ERROR] API call failed for '{keywords}': {e}")
            return []

    def fetch_et_news(self, keywords: str = "business"):
        """
        Fetches Indian business news using a keyword ladder fallback.
        Tags all articles with original keyword as Pinecone topic.
        """
        original_keywords = keywords.lower().strip()
        ladder = self._build_keyword_ladder(original_keywords)

        articles = []

        for attempt in ladder:
            print(f"[NEWS API] Trying: '{attempt}'")
            articles = self._fetch_from_api(attempt)
            if articles:
                print(f"[NEWS API] Success: {len(articles)} articles for '{attempt}'")
                break
            print(f"[NEWS API] 0 results, trying next...")

        if not articles:
            print(f"[NEWS API] All attempts exhausted for '{original_keywords}'.")
            return 0

        # Build upsert items
        items_to_upsert = []
        for art in articles:
            description = art.get('description', '')[:300]
            content = art.get('content', '') or description
            text_content = (
                f"{art.get('title', '')}. "
                f"{description}. "
                f"{content[:400]}"
            )

            items_to_upsert.append({
                "id": str(uuid.uuid4()),
                "text": text_content,
                "metadata": {
                    "title": art.get('title') or '',
                    "description": description or '',
                    "date": (art.get('pubDate') or datetime.now().strftime('%Y-%m-%d'))[:10],
                    "pubDate": (art.get('pubDate') or datetime.now().strftime('%Y-%m-%d'))[:10],
                    "category": "Business",
                    "source": art.get('source_id') or 'unknown',
                    "url": art.get('link') or '',
                    "image_url": art.get('image_url') or '',   
            }
})

        # Tag with ORIGINAL keyword so Pinecone filter matches
        self.ps.upsert_news(items_to_upsert, topic=original_keywords)

        print(f"[INFO] Upserted {len(items_to_upsert)} articles. Waiting for Pinecone...")
        time.sleep(3)

        return len(items_to_upsert)