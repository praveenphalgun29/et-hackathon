import re
import asyncio
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agents.master_editor import app_graph
from app.services.news_api_service import NewsApiService

app = FastAPI(
    title="ET Intelligence Engine",
    description="AI-Native News Experience",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

news_service = NewsApiService()

CONVERSATIONAL_PHRASES = [
    "give me a deep briefing on",
    "give me a briefing on",
    "deep briefing on",
    "briefing on",
    "track the story of",
    "track story of",
    "story arc of",
    "story of",
    "timeline of",
    "history of",
    "arc of",
    "what is happening in",
    "what's happening in",
    "what is happening with",
    "what's happening with",
    "latest news on",
    "latest news about",
    "latest news",
    "tell me about",
    "tell me",
    "synthesize all updates on",
    "synthesize updates on",
    "synthesize all updates about",
    "synthesize updates about",
    "synthesize",
    "summarize",
    "explain the",
    "explain",
    "navigator",
    "what happened to",
    "what happened with",
    "deep dive on",
    "deep dive into",
    "give me",
    "show me",
    "find me",
    "get me",
    "all updates on",
    "all updates about",
    "updates on",
    "updates about",
    "news on",
    "news about",
    "market war between",
    "war between",
    "battle between",
    "vs",
    "versus",
]

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "shall",
    "new", "all", "some", "any", "this", "that", "these", "those",
    "its", "it", "their", "our", "your", "my", "me", "us", "they",
    "he", "she", "we", "i", "what", "how", "why", "when", "where",
    "about", "case", "story", "update", "updates", "latest",
    "recent", "current", "today", "now", "please", "next", "week",
    "month", "year", "day", "time", "get", "make", "take", "go",
}

# Top trending Indian business topics for daily briefing
# Used when no user query is provided
DAILY_BRIEFING_TOPICS = [
    "Sensex market outlook", 
    "FII investment India", 
    "Nifty 50 market analysis",
    "startup funding news India",
    "Indian rupee exchange rate"
]


def extract_keywords(query: str) -> str:
    cleaned = query.lower().strip()
    for phrase in sorted(CONVERSATIONAL_PHRASES, key=len, reverse=True):
        cleaned = cleaned.replace(phrase, " ")
    cleaned = re.sub(r'[?!,.:;\'\"()]', '', cleaned)
    words = cleaned.split()
    meaningful = [w for w in words if w not in STOPWORDS and len(w) > 1]
    result = " ".join(meaningful).strip()
    if not result:
        return query.strip()
    print(f"[KEYWORD] '{query}' → '{result}'")
    return result


class NewsRequest(BaseModel):
    query: str
    persona: str = "General Reader"
    language: str = "English"
    follow_up: str = ""


class DailyBriefingRequest(BaseModel):
    persona: str = "General Reader"
    language: str = "English"
    # Optional: user can pass custom topics, otherwise we use defaults
    topics: list = []


@app.get("/")
async def root():
    return {"status": "ET Intelligence Engine is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/ask")
async def ask_ai(request: NewsRequest):
    try:
        keywords = extract_keywords(request.query)
        print(f"[INFO] Raw query       : {request.query}")
        print(f"[INFO] Cleaned keywords: {keywords}")
        if request.follow_up:
            print(f"[INFO] Follow-up       : {request.follow_up}")

        news_items = await news_service.fetch_et_news(keywords)

        # Formatted fallback docs in case Pinecone is not ready
        fallback_docs = [
            {
                "metadata": {
                    "title": item.get("metadata", {}).get("title"),
                    "description": item.get("text", ""),
                    "pubDate": item.get("metadata", {}).get("pubDate")
                }
            } for item in news_items
        ]

        inputs = {
            "query": request.query,
            "keywords": keywords,
            "persona": request.persona,
            "language": request.language,
            "follow_up": request.follow_up or "",
            "retrieved_docs": fallback_docs,
            "final_output": "",
            "next_step": ""
        }

        print(f"[INFO] Invoking agent graph...")
        result = app_graph.invoke(inputs)
        print(f"[INFO] Agent completed successfully.")

        return {
            "query": request.query,
            "keywords_used": keywords,
            "response": result["final_output"],
            "persona_applied": request.persona,
            "language_applied": request.language,
            "source_domain": "economictimes.indiatimes.com"
        }

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


import asyncio

async def process_topic(topic, request, news_service):
    """Worker function to process a single briefing topic."""
    print(f"[DEBUG] process_topic START: '{topic}' | LANG: {request.language} | PERSONA: {request.persona}")
    try:
        # Step 1: Fetch news
        news_items = await news_service.fetch_et_news(topic)
        if not news_items:
            print(f"[DEBUG] '{topic}' -> 0 news articles fetched. NewsData might be empty or restricted.")
            return None
        
        print(f"[DEBUG] '{topic}' -> Fetched {len(news_items)} articles.")

        # Formatted fallback docs
        fallback_docs = [
            {
                "metadata": {
                    "title": item.get("metadata", {}).get("title"),
                    "description": item.get("text", ""),
                    "pubDate": item.get("metadata", {}).get("pubDate")
                }
            } for item in news_items
        ]

        # Nitro Mode disabled: Always use AI synthesis for persona-aware content
        if False:
            pass
        else:
            # Step 2: AI Generation
            inputs = {
                "query": f"What is the latest on {topic}",
                "keywords": topic,
                "persona": request.persona,
                "language": request.language,
                "follow_up": "",
                "retrieved_docs": fallback_docs,
                "final_output": "",
                "next_step": ""
            }

            print(f"[DEBUG] '{topic}' -> Starting AI generation thread...")
            result = await asyncio.to_thread(app_graph.invoke, inputs)
            print(f"[DEBUG] '{topic}' -> AI generation finished.")

            if not result.get("final_output"):
                print(f"[DEBUG] '{topic}' -> AI returned EMPTY final_output.")
                return None

            print(f"[DAILY BRIEFING] ✓ Card successfully built for '{topic}'")
            final_summary = result.get("final_output", "")

        # Step 3: Fast Translation Pass (if needed)
        if request.language and request.language.lower() != "english":
            print(f"[TRANSLATION] Translating '{topic}' to {request.language}...")
            try:
                translation_prompt = f"Translate the following news summary into {request.language}. Maintain the markdown formatting and professional tone:\n\n{final_summary}"
                # Use a direct fast call to avoid LangGraph overhead for simple translation
                from app.agents.master_editor import call_llm_with_fallback
                translated = await asyncio.to_thread(call_llm_with_fallback, translation_prompt)
                if translated:
                    final_summary = translated
                    print(f"[TRANSLATION] ✓ Success for '{topic}'")
            except Exception as e:
                print(f"[TRANSLATION] failed for '{topic}': {e}")

        return {
            "topic": topic,
            "summary": final_summary,
            "persona_applied": request.persona,
            "language_applied": request.language
        }
    except Exception as e:
        print(f"[CRITICAL ERROR] process_topic FAILED for '{topic}': {str(e)}")
        import traceback
        traceback.print_exc()
        return None


@app.post("/daily-briefing")
async def daily_briefing(request: DailyBriefingRequest):
    """
    Proactive Daily Briefing endpoint — optimized parallel processing.
    """
    try:
        topics = request.topics if request.topics else DAILY_BRIEFING_TOPICS
        print(f"[DAILY BRIEFING] STARTING PARALLEL PROCESS for {len(topics)} topics")
        
        # Create tasks for all topics (Bypassing embeddings makes this safe again)
        tasks = [process_topic(topic, request, news_service) for topic in topics]
        
        # Run all tasks concurrently with a 45s timeout
        try:
            results = await asyncio.wait_for(asyncio.gather(*tasks, return_exceptions=True), timeout=45.0)
        except asyncio.TimeoutError:
            print("[DAILY BRIEFING] !!! TIMEOUT !!! Some tasks didn't finish. Returning partial results.")
            results = []

        # Filter out None results or Exceptions
        briefing_cards = []
        if results:
            for r in results:
                if r and not isinstance(r, Exception):
                    briefing_cards.append(r)
                elif isinstance(r, Exception):
                    print(f"[DAILY BRIEFING] Task failed: {r}")

        if not briefing_cards:
            print("[DAILY BRIEFING] !!! NO CARDS GENERATED !!! Returning 503.")
            raise HTTPException(
                status_code=503,
                detail="Could not fetch any news articles. Please check API keys or try again."
            )

        print(f"[DAILY BRIEFING] SUCCESS: Returning {len(briefing_cards)} cards.")
        return {
            "type": "daily_briefing",
            "persona": request.persona,
            "language": request.language,
            "total_topics": len(briefing_cards),
            "briefing": briefing_cards,
            "source_domain": "economictimes.indiatimes.com"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Daily briefing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Daily briefing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)