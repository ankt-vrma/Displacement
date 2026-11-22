from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send, interrupt

from app.graph.agents.budget_agent import budget_agent
from app.graph.agents.flight_agent import flight_agent
from app.graph.agents.hotel_agent import hotel_agent
from app.graph.agents.itinerary_agent import itinerary_agent
from app.graph.agents.weather_agent import weather_agent
from app.graph.state import TravelState
from app.graph.supervisor import supervisor_node

PARALLEL_AGENTS = ["flight", "hotel", "weather"]  # independent -> run concurrently


# ---------- routing ----------
def route_after_supervisor(state: TravelState):
    selected = state.get("selected_agents", [])
    sends = [Send(f"{a}_agent", state) for a in PARALLEL_AGENTS if a in selected]
    return sends or "join"


def route_after_join(state: TravelState) -> str:
    selected = state.get("selected_agents", [])
    if "budget" in selected:
        return "budget_agent"
    if "itinerary" in selected:
        return "itinerary_agent"
    return "compile_plan"


def route_after_budget(state: TravelState) -> str:
    return "itinerary_agent" if "itinerary" in state.get("selected_agents", []) else "compile_plan"


def route_after_review(state: TravelState) -> str:
    return "finalize" if state.get("approved") else "supervisor"


# ---------- plain nodes ----------
async def join_node(state: TravelState) -> dict:
    return {}  # fan-in point: runs after all parallel agents finish


async def compile_plan_node(state: TravelState) -> dict:
    trip = state.get("trip", {})
    title = f"# Trip: {trip.get('origin') or ''} to {trip.get('destination') or ''}".strip()
    sections = [
        ("## Flights", state.get("flight_result")),
        ("## Hotels", state.get("hotel_result")),
        ("## Weather", state.get("weather_result")),
        ("## Budget", state.get("budget_result")),
        ("## Itinerary", state.get("itinerary_result")),
    ]
    parts = [title] + [f"{h}\n{body}" for h, body in sections if body]
    return {"draft_plan": "\n\n".join(parts)}


def human_review_node(state: TravelState) -> dict:
    # Pauses the graph. Resumes with whatever the API passes via Command(resume=...).
    decision = interrupt(
        {"draft_plan": state["draft_plan"], "message": "Approve, or send feedback to refine."}
    )
    if decision.get("action") == "approve":
        return {"approved": True, "feedback": ""}
    return {
        "approved": False,
        "feedback": decision.get("feedback", ""),
        "revision_count": state.get("revision_count", 0) + 1,
    }


async def finalize_node(state: TravelState) -> dict:
    return {"final_plan": state["draft_plan"]}


# ---------- graph ----------
def build_graph():
    g = StateGraph(TravelState)

    g.add_node("supervisor", supervisor_node)
    g.add_node("flight_agent", flight_agent)
    g.add_node("hotel_agent", hotel_agent)
    g.add_node("weather_agent", weather_agent)
    g.add_node("join", join_node)
    g.add_node("budget_agent", budget_agent)
    g.add_node("itinerary_agent", itinerary_agent)
    g.add_node("compile_plan", compile_plan_node)
    g.add_node("human_review", human_review_node)
    g.add_node("finalize", finalize_node)

    g.add_edge(START, "supervisor")
    g.add_conditional_edges(
        "supervisor",
        route_after_supervisor,
        ["flight_agent", "hotel_agent", "weather_agent", "join"],
    )
    for name in ("flight_agent", "hotel_agent", "weather_agent"):
        g.add_edge(name, "join")

    g.add_conditional_edges("join", route_after_join, ["budget_agent", "itinerary_agent", "compile_plan"])
    g.add_conditional_edges("budget_agent", route_after_budget, ["itinerary_agent", "compile_plan"])
    g.add_edge("itinerary_agent", "compile_plan")
    g.add_edge("compile_plan", "human_review")
    g.add_conditional_edges("human_review", route_after_review, ["finalize", "supervisor"])
    g.add_edge("finalize", END)

    # MemorySaver keeps HITL state in RAM; swap for a Postgres checkpointer later.
    return g.compile(checkpointer=MemorySaver())


graph = build_graph()