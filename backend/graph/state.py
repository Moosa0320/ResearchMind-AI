from typing import TypedDict, List, Dict, Any, Optional

class SourceNote(TypedDict):
    id: str
    title: str
    content: str
    url: Optional[str]
    source_type: str # 'web' or 'pdf'
    relevance_score: float

class Citation(TypedDict):
    id: int
    title: str
    url: str
    snippet: str

class AgentEvent(TypedDict):
    agent: str
    status: str # 'started', 'completed', 'in_progress', 'error'
    message: str
    timestamp: float

class ResearchState(TypedDict):
    query: str
    session_id: str
    subtasks: List[str]
    research_notes: List[SourceNote]
    verified_notes: List[SourceNote]
    outline: List[str]
    draft_report: str
    final_report: str
    citations: List[Citation]
    confidence_score: float
    retry_count: int
    status_log: List[AgentEvent]
