from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import TravelState
from app.services.llm import get_llm, to_text
from app.tools.flight_tools import search_flights
from app.tools.search_tools import web_search

SYSTEM = (
    "You are a flight-planning agent. Summarise the best flight options from the data given. "
    "Aviation data has schedules but no fares, so give price ESTIMATES from the web results and "
    "label them as estimates. Write currency as codes (INR, USD), never symbols. Be concise, markdown."
)


async def flight_agent(state: TravelState) -> dict:
    trip = state["trip"]
    schedules = await search_flights(trip.get("origin_iata"), trip.get("destination_iata"))
    prices = await web_search(
        f"flight ticket price {trip.get('origin')} to {trip.get('destination')} {trip.get('start_date') or ''}"
    )
    prompt = (
        f"Trip: {trip}\n\nSchedules (Aviationstack): {schedules}\n\nPrice info (web): {prices}"
        f"\n\nUser feedback to address (if any): {state.get('feedback', '')}"
    )
    resp = await get_llm().ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=prompt)])
    return {"flight_result": to_text(resp.content)}