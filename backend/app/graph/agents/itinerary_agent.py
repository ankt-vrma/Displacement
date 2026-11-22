from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import TravelState
from app.services.llm import get_llm, to_text

SYSTEM = (
    "You are an itinerary agent. Create a realistic day-by-day plan (morning/afternoon/evening) that "
    "fits the weather, budget and preferences. Write currency as codes (INR, USD), never symbols. Markdown."
)


async def itinerary_agent(state: TravelState) -> dict:
    prompt = (
        f"Trip: {state['trip']}\n\nWeather:\n{state.get('weather_result', 'n/a')}"
        f"\n\nHotels:\n{state.get('hotel_result', 'n/a')}"
        f"\n\nBudget:\n{state.get('budget_result', 'n/a')}"
        f"\n\nUser feedback to address (if any): {state.get('feedback', '')}"
    )
    resp = await get_llm().ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=prompt)])
    return {"itinerary_result": to_text(resp.content)}