# 🔴 ET Intelligence Engine

> **AI-Native News Experience for the Economic Times**
> A multi-agent, persona-aware intelligence platform that transforms raw business news into actionable, personalized insights — in English, Hindi, Tamil, Telugu & Bengali.


---

## ✨ Features

### 🗞️ My Newsroom — Personalized Daily Briefing
AI-curated briefing cards generated from live Economic Times sources. Each card is synthesized by a persona-aware LLM pipeline, delivering content tailored specifically for Investors, Traders, Students, Startup Founders, or General Readers.

### 🧭 News Navigator — Deep Intelligence Briefing
An AI command center for structured, multi-turn deep dives. Ask any business question and receive a four-section intelligence report: **Key Developments → Strategic Implications → Outlook → Follow-up Questions**. Supports conversational follow-ups.

### 📖 Story Arc — Narrative Tracker
Tracks the evolution of any business story with five AI-generated components:
- **Interactive Timeline** — chronological inflection points with sentiment scoring
- **Key Stakeholders** — players and their market stance (Bullish / Bearish / Neutral)
- **Contrarian View** — dissenting perspectives and risk signals
- **Intelligence Signals** — forward-looking predictions with confidence ratings
- **Summary Banner** — two-sentence synthesis of the current narrative state

### 🌐 Vernacular Intelligence — Multilingual Adaptation
Real-time cultural adaptation of business news into **Hindi, Tamil, Telugu, and Bengali**. Not just translation — financial jargon is explained naturally in the target language with side-by-side English comparison.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React + Vite Frontend                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Newsroom │ │Navigator │ │Story Arc │ │  Vernacular   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (REST)
┌───────────────────────▼─────────────────────────────────────┐
│                  FastAPI Backend (Python)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LangGraph Agent Pipeline               │    │
│  │                                                     │    │
│  │  master_router ──┬── persona_editor ──┐             │    │
│  │                  ├── synthesizer ─────┤             │    │
│  │                  └── story_architect ─┤             │    │
│  │                                      ▼             │    │
│  │                            vernacular_engine        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │  Gemini 2.0  │  │  Groq (Llama) │  │  NewsData API  │   │
│  │  (Primary)   │  │  (Fallback)   │  │  (Live News)   │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │  Pinecone Vector DB  │  │  HuggingFace Embeddings    │   │
│  │  (Semantic Search)   │  │  (all-MiniLM-L6-v2)        │   │
│  └──────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
et-hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server — /ask, /daily-briefing endpoints
│   │   ├── agents/
│   │   │   ├── master_editor.py     # LangGraph pipeline — router, 4 agent nodes, LLM fallback
│   │   │   └── state.py            # AgentState TypedDict schema
│   │   └── services/
│   │       ├── news_api_service.py  # NewsData API client with keyword ladder fallback
│   │       └── pinecone_service.py  # Pinecone vector DB — upsert & semantic query
│   ├── requirements.txt
│   ├── .env                         # API keys (Gemini, Groq, Pinecone, NewsData, LangSmith)
│   └── test_*.py                    # Test scripts
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main app — view routing, search, briefing logic
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global styles & design system
│   │   ├── App.css                  # App-specific styles
│   │   └── components/
│   │       ├── Navbar.jsx           # Top bar — ticker tape, persona & language selectors
│   │       ├── Sidebar.jsx          # Left nav — view switcher
│   │       ├── NewsroomView.jsx     # Daily briefing cards + search + follow-ups
│   │       ├── NewsNavigatorView.jsx # Deep briefing with multi-turn AI
│   │       ├── StoryArcView.jsx     # Timeline, stakeholders, contrarian view, predictions
│   │       ├── VernacularView.jsx   # Side-by-side multilingual display
│   │       ├── RightSidebar.jsx     # Trending insights + market movers
│   │       └── UnlockModal.jsx      # ET Prime unlock modal
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- API keys for: Gemini, Groq, Pinecone, NewsData.io, LangSmith (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/rajanarahul93/et-hackathon.git
cd et-hackathon
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
# LLM API Keys
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_gemini_api_key

# Vector DB
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=et-news-index

# LangSmith (optional)
LANGCHAIN_TRACING=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_PROJECT=et-intelligence

# NewsData
NEWSDATA_API_KEY=your_newsdata_api_key

# Threading Safety
TOKENIZERS_PARALLELISM=false
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health status |
| `/health` | GET | Health check |
| `/ask` | POST | Query the AI intelligence engine |
| `/daily-briefing` | POST | Generate a 5-topic personalized briefing |

### POST `/ask` — Request Body

```json
{
  "query": "Sensex market outlook",
  "persona": "Investor",
  "language": "English",
  "follow_up": ""
}
```

### POST `/daily-briefing` — Request Body

```json
{
  "persona": "Investor",
  "language": "English",
  "topics": []
}
```

---

## 🧠 Agent Pipeline

The backend uses a **LangGraph** state machine with four specialized agent nodes:

| Agent | Role | Trigger |
|---|---|---|
| **Persona Editor** | Persona-tailored news rewriting | Default queries |
| **Synthesizer** | Structured intelligence briefing + follow-ups | "briefing", "summarize", "explain" |
| **Story Architect** | 5-component narrative analysis (timeline, players, contrarian, predictions, summary) | "track", "timeline", "arc", "story" |
| **Vernacular Engine** | Cultural translation to Hindi, Tamil, Telugu, Bengali | Non-English language selected |

**LLM Strategy:** Gemini 2.0 Flash (primary) → Groq Llama 3.1 8B (fallback)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Framer Motion, Lucide Icons, React Markdown |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI Orchestration** | LangGraph, LangChain |
| **LLMs** | Google Gemini 2.0 Flash, Groq (Llama 3.1 8B) |
| **Vector DB** | Pinecone (Serverless) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` |
| **News Source** | NewsData.io API (Indian business news) |
| **Observability** | LangSmith tracing |

---

## 👥 Personas

The engine adapts all content based on the selected persona:

| Persona | Focus |
|---|---|
| **Student** | Jargon-free explanations, "What this means" sections |
| **Investor** | ROI impact, stock implications, data-driven analysis |
| **Startup Founder** | Funding landscape, competitor moves, regulatory changes |
| **Trader** | Technical signals, price action, volumes, key levels |
| **General Reader** | Balanced summary, conversational tone, big picture |

---

## 📄 License

This project was built for the **ET Hackathon**.
