from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import SupervisorDecision, TravelState
from app.services.llm import get_llm

SYSTEM = """You are the supervisor of a travel-planning system.
1. Extract trip details from the user's query (use IATA airport codes when you can infer them).
2. Choose ONLY the agents needed:
   - flight: flight options/schedules between cities
   - hotel: accommodation options
   - weather: forecast / climate info
   - budget: cost estimate (needs flight/hotel info, so also pick those if relevant)
   - itinerary: day-by-day plan
If the user only asks about one thing (e.g. hotels), select only that agent.
If this is a revision, select ONLY the agents that must re-run to address the feedback."""


async def supervisor_node(state: TravelState) -> dict:
    llm = get_llm().with_structured_output(SupervisorDecision)

    content = f"User query: {state['query']}"
    if state.get("profile"):
        content += (
            "\n\nTraveller profile (use only as defaults when the query does not say otherwise): "
            f"{state['profile']}"
        )
    if state.get("feedback"):
        content += (
            f"\n\nCurrent draft plan:\n{state.get('draft_plan', '')}"
            f"\n\nUser feedback on the draft: {state['feedback']}"
        )

    decision: SupervisorDecision = await llm.ainvoke(
        [SystemMessage(content=SYSTEM), HumanMessage(content=content)]
    )
    return {
        "trip": decision.trip.model_dump(),
        "selected_agents": list(decision.agents),
    }