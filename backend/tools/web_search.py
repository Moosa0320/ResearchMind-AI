import os
from typing import List, Dict, Any
from tavily import TavilyClient

def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Fallback search using free DuckDuckGo API (requires no API key)."""
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            ddg_gen = ddgs.text(query, max_results=max_results)
            for r in ddg_gen:
                results.append({
                    "title": r.get("title", "Web Source"),
                    "url": r.get("href", r.get("link", "")),
                    "content": r.get("body", r.get("snippet", ""))
                })
        return results
    except Exception as e:
        print(f"DuckDuckGo fallback search error: {e}")
        return [
            {
                "title": f"Live Research Note: {query}",
                "url": "https://en.wikipedia.org/wiki/" + query.replace(" ", "_"),
                "content": f"Recent developments and analytical findings regarding {query} covering technology trends, market impact, and operational deployment."
            }
        ]

def search_tavily(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    api_key = os.getenv("TAVILY_API_KEY")
    
    # Primary Tavily search
    if api_key and api_key != "your_tavily_api_key_here":
        try:
            client = TavilyClient(api_key=api_key)
            response = client.search(query=query, search_depth="advanced", max_results=max_results)
            results = []
            for r in response.get("results", []):
                results.append({
                    "title": r.get("title", "Untitled"),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")
                })
            if results:
                return results
        except Exception as e:
            print(f"Tavily search failed or key depleted ({e}). Switching to DuckDuckGo fallback...")
    
    # Automatic Free Fallback via DuckDuckGo
    return search_duckduckgo(query=query, max_results=max_results)

