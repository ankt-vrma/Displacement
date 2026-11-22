from typing import Literal, TypedDict

from pydantic import BaseModel, Field

AgentName = Literal["flight", "hotel", "weather", "budget", "itinerary"]


class TripDetails(BaseModel):
    origin: str | None = None
    destination: str | None = None
    origin_iata: str | None = Field(None, description="IATA code of the origin airport, e.g. DEL")
    destination_iata: str | None = Field(None, description="IATA code of the destination airport")
    start_date: str | None = Field(None, description="YYYY-MM-DD if known")
    end_date: str | None = Field(None, description="YYYY-MM-DD if known")
    duration_days: int | None = None
    travelers: int = 1
    budget: str | None = None
    preferences: list[str] = []


class SupervisorDecision(BaseModel):
    trip: TripDetails
    agents: list[AgentName] = Field(description="Only the agents needed for this query")
    reasoning: str


class TravelState(TypedDict, total=False):
    query: str
    trip: dict
    selected_agents: list[str]

    flight_result: str
    hotel_result: str
    weather_result: str
    budget_result: str
    itinerary_result: str

    draft_plan: str
    feedback: str
    approved: bool
    final_plan: str
    revision_count: int

    user_id: str
    profile: dict