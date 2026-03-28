import os
import json
import re
from langgraph.graph import StateGraph, END
from .state import AgentState
from langchain_groq import ChatGroq
from google import genai
from app.services.pinecone_service import PineconeService

ps = PineconeService()
groq_llm = ChatGroq(temperature=0.1, model_name="llama-3.1-8b-instant")
genai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def master_router(state: AgentState):
    if state.get('follow_up', '').strip():
        return "synthesizer"
    query = state['query'].lower()
    if any(word in query for word in ["track", "timeline", "history", "arc", "story"]):
        return "story_architect"
    elif any(word in query for word in ["briefing", "summarize", "navigator", "deep", "explain"]):
        return "synthesizer"
    else:
        return "persona_editor"


def build_rich_context(matches):
    if not matches:
        return None
    parts = []
    for res in matches:
        meta = res.get('metadata', {})
        title = meta.get('title', 'No title')
        description = meta.get('description', meta.get('text', ''))[:250]
        pub_date = meta.get('pubDate', meta.get('date', 'Unknown date'))
        parts.append(
            f"Date: {pub_date}\n"
            f"Title: {title}\n"
            f"Summary: {description}"
        )
    return "\n\n---\n\n".join(parts)


def safe_parse_json_array(raw: str) -> list:
    """
    Safely parses a JSON array from LLM output.
    Strips markdown fences, finds the array, validates it.
    Returns empty list on any failure.
    """
    raw = re.sub(r"^```json\s*", "", raw.strip())
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw).strip()
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return parsed
        return []
    except json.JSONDecodeError:
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []
        return []


def persona_editor_node(state: AgentState):
    """MY ET: Personalized Newsroom"""
    lookup = state.get('keywords') or state['query']
    results = ps.query_news(lookup, top_k=5)
    matches = results.get('matches', [])
    context = build_rich_context(matches)

    if not context:
        return {"final_output": f"No recent news found for '{lookup}'. Please try a different topic."}

    prompt = f"""You are an ET Senior Editor. Rewrite the following news for a {state['persona']}.
Use ONLY information from the provided context. Do not invent facts.

Rules by persona:
- Student: Explain all jargon in simple terms. Add "What this means" sections. Keep it educational.
- Investor: Lead with numbers, ROI impact, stock implications, portfolio risk. Be data-driven.
- Startup Founder: Focus on funding landscape, competitor moves, regulatory changes, market gaps.
- Trader: Focus on technical signals, short-term price action, volumes, key levels to watch.
- General Reader: Balanced summary, no jargon, conversational tone, explain why it matters.

Context (real articles only):
{context}

Write a clear, engaging 3-4 paragraph summary tailored specifically for a {state['persona']}.
Do not use generic phrases like "it's important to note". Be direct and specific.
"""
    response = groq_llm.invoke(prompt)
    return {"final_output": response.content}


def synthesizer_node(state: AgentState):
    """NEWS NAVIGATOR: Deep Briefing + Multi-turn Follow-up"""
    lookup = state.get('keywords') or state['query']
    follow_up = state.get('follow_up', '').strip()

    results = ps.query_news(lookup, top_k=6)
    matches = results.get('matches', [])
    context = build_rich_context(matches)

    if not context:
        return {"final_output": f"No recent news found for '{lookup}'. Please try a different topic."}

    if follow_up:
        print(f"[SYNTHESIZER] Handling follow-up: '{follow_up}'")
        prompt = f"""You are an ET Intelligence Analyst answering a follow-up question.
The user previously asked about: {state['query']}
Their follow-up question is: {follow_up}

Use ONLY the articles below to answer. Be specific and direct.
If the answer is not in the articles, say so honestly — do not invent.

Articles:
{context}
"""
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"final_output": response.text}

    prompt = f"""You are an ET Intelligence Analyst. Using ONLY the articles below,
synthesize a structured intelligence briefing about: {lookup}
Do NOT add information beyond what is in the context.

Structure with exactly these FOUR sections:

## Key Developments
(3-5 factual bullet points. Include specific dates and numbers where available.)

## Strategic Implications
(What this means for businesses, investors, or the Indian economy. Be specific.)

## Outlook
(Short-term expectations based on signals in the articles. What happens next?)

## Follow-up Questions
(Exactly 3 smart, specific questions the reader can ask to go deeper.)

Context (real articles only):
{context}
"""
    response = genai_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return {"final_output": response.text}


def story_architect_node(state: AgentState):
    """
    STORY ARC TRACKER
    5 components: Timeline, Key Players, Contrarian Perspectives,
    What To Watch Next, Summary
    """
    lookup = state.get('keywords') or state['query']
    print(f"[STORY ARC] Looking up: '{lookup}'")

    results = ps.query_news(lookup, top_k=6)
    matches = results.get('matches', [])
    context = build_rich_context(matches)

    if not matches or not context:
        fallback = json.dumps({
            "timeline": [{
                "date": "Unknown",
                "event": f"No recent articles found for '{lookup}'.",
                "sentiment": 0.0,
                "impact": "Low"
            }],
            "key_players": [],
            "contrarian_perspectives": [],
            "what_to_watch": [],
            "summary": f"Insufficient data found for '{lookup}'. Try a more specific topic."
        })
        return {"final_output": f"ARC_DATA_START\n{fallback}\nARC_DATA_END"}

    # --- LLM Call 1: Timeline ---
    timeline_prompt = f"""You are a Data Journalist at Economic Times.
Build a Story Arc timeline for: "{lookup}"

STRICT RULES:
1. Use ONLY the articles in the context below.
2. Do NOT invent events not mentioned in the articles.
3. If an article has no clear date, use "Unknown".
4. Sentiment: -1.0 = very negative, 0.0 = neutral, 1.0 = very positive.
5. Return ONLY a valid JSON array. No explanation, no preamble, no markdown backticks.

Output EXACTLY this format:
[
  {{"date": "YYYY-MM-DD", "event": "Short event title from article", "sentiment": 0.0, "impact": "High/Med/Low"}}
]

Context:
{context}
"""
    timeline = safe_parse_json_array(groq_llm.invoke(timeline_prompt).content)
    print(f"[STORY ARC] Timeline: {len(timeline)} events")

    # --- LLM Call 2: Key Players ---
    players_prompt = f"""You are a business journalist. From the articles below about "{lookup}",
extract the key people and organizations directly involved.

Return ONLY a valid JSON array. No explanation, no markdown backticks.

Output EXACTLY this format:
[
  {{"name": "Person or Company Name", "role": "Their specific role in this story", "sentiment": 0.0}}
]

Rules:
- sentiment: -1.0 = negative role, 0.0 = neutral, 1.0 = positive role
- Include ONLY people/companies directly mentioned in the articles
- Maximum 6 players
- If no clear players found, return []

Context:
{context}
"""
    key_players = safe_parse_json_array(groq_llm.invoke(players_prompt).content)
    print(f"[STORY ARC] Key players: {len(key_players)} found")

    # --- LLM Call 3: Contrarian Perspectives ---
    contrarian_prompt = f"""You are an investigative journalist covering "{lookup}".
Your job is to find the OTHER SIDE of this story — risks, critic opinions,
dissenting voices, bearish outlooks, or red flags that challenge the main narrative.

Look for:
- Critics or analysts with negative views
- Risks or downsides mentioned in the articles
- Regulatory concerns or legal challenges
- Market skepticism or bearish signals
- Any "but" or "however" angles in the coverage

Return ONLY a valid JSON array. No explanation, no markdown backticks.

Output EXACTLY this format:
[
  {{"perspective": "One sentence contrarian view", "source": "Who said this or which article", "severity": "High/Med/Low"}}
]

Rules:
- Use ONLY information from the articles below
- Maximum 3 perspectives
- If no contrarian views exist in the articles, return []
- Do NOT invent criticism not present in the articles

Context:
{context}
"""
    contrarian_perspectives = safe_parse_json_array(
        groq_llm.invoke(contrarian_prompt).content
    )
    print(f"[STORY ARC] Contrarian perspectives: {len(contrarian_perspectives)} found")

    # --- LLM Call 4: What To Watch Next (refined — must cite specific signals) ---
    predictions_prompt = f"""You are a senior ET market analyst covering "{lookup}".
Based ONLY on specific signals in the articles below, predict what to watch next.

STRICT RULES:
1. Every prediction MUST reference a specific fact from the articles.
   GOOD: "SEBI review deadline is March 31 — outcome will set regulatory tone"
   BAD: "Market may remain volatile" (too generic, no article basis)
2. Maximum 3 predictions
3. Base ONLY on signals explicitly mentioned in the articles
4. If no clear signals exist, return []

Return ONLY a valid JSON array. No explanation, no markdown backticks.

Output EXACTLY this format:
[
  {{
    "prediction": "Specific prediction citing an article fact",
    "signal": "The specific fact from the article that supports this",
    "timeframe": "Days/Weeks/Months",
    "confidence": "High/Med/Low"
  }}
]

Context:
{context}
"""
    what_to_watch = safe_parse_json_array(
        groq_llm.invoke(predictions_prompt).content
    )
    print(f"[STORY ARC] What to watch: {len(what_to_watch)} predictions")

    # --- LLM Call 5: One-paragraph summary for context ---
    summary_prompt = f"""In exactly 2 sentences, summarize the current state of the "{lookup}" story
based ONLY on the articles below. Be factual and specific.

Context:
{context}
"""
    summary_response = groq_llm.invoke(summary_prompt)
    summary = summary_response.content.strip()

    # --- Combine all 5 components ---
    final_data = {
        "timeline": timeline,
        "key_players": key_players,
        "contrarian_perspectives": contrarian_perspectives,
        "what_to_watch": what_to_watch,
        "summary": summary
    }

    return {"final_output": f"ARC_DATA_START\n{json.dumps(final_data)}\nARC_DATA_END"}


def vernacular_engine_node(state: AgentState):
    """VERNACULAR ENGINE: Hindi, Tamil, Telugu, Bengali"""
    language = state.get('language', 'English').strip()

    if language.lower() == "english":
        return {"final_output": state['final_output'], "next_step": "end"}

    print(f"--- TRANSLATING TO {language} ---")

    content = state['final_output']

    if content.startswith("ARC_DATA_START"):
        return {"final_output": content, "next_step": "end"}

    prompt = f"""Translate and culturally adapt the following Indian business news into {language}.

STRICT RULES:
1. Do NOT literally translate financial jargon — explain it naturally in {language}.
   Examples:
   - "Repo rate hike" → explain as borrowing costs went up, EMIs may rise
   - "SEBI" → explain as India's stock market regulator
   - "Sensex" → explain as India's main stock market index
   - "Bull market" → explain as a period when stock prices are rising
   - "Bear market" → explain as a period when stock prices are falling
2. Keep all numbers, percentages, company names, and proper nouns as-is.
3. Use natural, conversational {language} — not formal textbook language.
4. Preserve the paragraph structure of the original.
5. For Tamil — use Tamil script (தமிழ்)
6. For Telugu — use Telugu script (తెలుగు)
7. For Bengali — use Bengali script (বাংলা)
8. For Hindi — use Devanagari script (हिंदी)

Content to translate:
{content}
"""
    response = groq_llm.invoke(prompt)
    return {"final_output": response.content, "next_step": "end"}


# --- Graph Construction ---
workflow = StateGraph(AgentState)

workflow.add_node("persona_editor", persona_editor_node)
workflow.add_node("synthesizer", synthesizer_node)
workflow.add_node("story_architect", story_architect_node)
workflow.add_node("vernacular_engine", vernacular_engine_node)

workflow.set_conditional_entry_point(
    master_router,
    {
        "persona_editor": "persona_editor",
        "synthesizer": "synthesizer",
        "story_architect": "story_architect"
    }
)

workflow.add_edge("persona_editor", "vernacular_engine")
workflow.add_edge("synthesizer", "vernacular_engine")
workflow.add_edge("story_architect", "vernacular_engine")
workflow.add_edge("vernacular_engine", END)

app_graph = workflow.compile()