from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import TravelState
from app.services.llm import get_llm, to_text
from app.tools.weather_tools import get_forecast

SYSTEM = (
    "You are a weather agent. Summarise the forecast and give packing/timing advice. "
    "If forecast data is empty (dates too far ahead), say so and give typical seasonal conditions. Concise markdown."
)


async def weather_agent(state: TravelState) -> dict:
    trip = state["trip"]
    forecast = await get_forecast(trip.get("destination") or "", days=trip.get("duration_days") or 3)
    prompt = (
        f"Trip: {trip}\n\nForecast: {forecast}"
        f"\n\nUser feedback to address (if any): {state.get('feedback', '')}"
    )
    resp = await get_llm().ainvoke([SystemMessage(content=SYSTEM), HumanMessage(content=prompt)])
    return {"weather_result": to_text(resp.content)}