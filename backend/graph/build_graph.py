from langgraph.graph import StateGraph, END
from backend.graph.state import ResearchState
from backend.agents.multi_agent import (
    planner_node,
    researcher_node,
    fact_checker_node,
    writer_node,
    reviewer_node
)

def should_retry_research(state: ResearchState) -> str:
    confidence = state.get("confidence_score", 1.0)
    retry_count = state.get("retry_count", 0)
    if confidence < 0.70 and retry_count <= 1:
        return "researcher"
    return "writer"

def build_research_graph():
    workflow = StateGraph(ResearchState)

    # Define nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("fact_checker", fact_checker_node)
    workflow.add_node("writer", writer_node)
    workflow.add_node("reviewer", reviewer_node)

    # Build sequence
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "researcher")
    workflow.add_edge("researcher", "fact_checker")

    # Conditional edge loopback
    workflow.add_conditional_edges(
        "fact_checker",
        should_retry_research,
        {
            "researcher": "researcher",
            "writer": "writer"
        }
    )

    workflow.add_edge("writer", "reviewer")
    workflow.add_edge("reviewer", END)

    return workflow.compile()

research_app = build_research_graph()
