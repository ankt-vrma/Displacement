from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import TravelState
from app.services.llm import get_llm, to_text

SYSTEM = (
    "You are a budget agent. Build an itemised cost estimate (flights, stay, food, local transport, "
    "activities, buffer) using the info provided. Compare to the user's budget if given. "
    "Write currency as codes (INR, USD), never symbols. Concise markdown."
)


async def budget_agent(state: TravelState) -> dict:
    prompt = (
        f"Trip: {state['trip']}\n\nFlights:\n{state.get('flight_result', 'n/a')}"
        f"\n\nHotels:\n{state.get('hotel_result', 'n/a')}"
        f"\n\nUser feedback to address (if any): {state.get('feedback', '')}"
    )
    resp = await get_llm().ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=prompt)])
    return {"budget_result": to_text(resp.content)}