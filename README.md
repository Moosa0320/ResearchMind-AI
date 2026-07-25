# ResearchMind AI — Multi-Agent Research Assistant

Autonomous research platform powered by **Groq (Llama 3.3 70B)**, **LangGraph**, **FastAPI**, **ChromaDB**, and **React**.

![ResearchMind Architecture](./architecture.png)

## Highlights

- **Multi-Agent StateGraph**: Explicit state graph with 5 specialized nodes (Planner, Researcher, Fact-Checker, Writer, Reviewer).
- **Conditional Loopback**: Fact-Checker evaluates citation confidence and automatically triggers re-search loops if confidence drops below 70%.
- **Local RAG Integration**: Ingest custom PDF research papers into ChromaDB vector store.
- **Deep Signal UI**: Clean editorial dark aesthetic with real-time WebSocket agent execution tracking.

## Quick Start

### 1. Environment Setup
Copy `.env.example` to `.env` in `backend/` and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **FastAPI API**: `http://localhost:8000`
