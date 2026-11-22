from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import TravelState
from app.services.llm import get_llm, to_text
from app.tools.search_tools import web_search

SYSTEM = (
    "You are a hotel agent. From the web results, recommend 3 stays across budget tiers with area, "
    "approx nightly price and why. Write currency as codes (INR, USD), never symbols. Concise markdown."
)


async def hotel_agent(state: TravelState) -> dict:
    trip = state["trip"]
    prefs = ", ".join(trip.get("preferences", []))
    results = await web_search(
        f"best hotels in {trip.get('destination')} {prefs} price per night", max_results=6
    )
    prompt = (
        f"Trip: {trip}\n\nWeb results: {results}"
        f"\n\nUser feedback to address (if any): {state.get('feedback', '')}"
    )
    resp = await get_llm().ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=prompt)])
    return {"hotel_result": to_text(resp.content)}