from typing import Any, Literal

from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    query: str = Field(..., min_length=10, max_length=1000)


class FeedbackRequest(BaseModel):
    feedback: str = Field(..., min_length=3, max_length=1000)


class PlanResponse(BaseModel):
    thread_id: str
    status: Literal["awaiting_review", "completed"]
    selected_agents: list[str] = []
    trip: dict[str, Any] = {}
    draft_plan: str = ""
    revision_count: int = 0


class FinalPlanResponse(BaseModel):
    plan_id: str
    thread_id: str
    pdf_url: str | None
    final_plan: str

class SavedPlanSummary(BaseModel):
    id: str
    thread_id: str
    query: str
    trip: dict[str, Any] | None = None
    created_at: str


class SavedPlan(SavedPlanSummary):
    final_plan: str
    pdf_url: str | None = None

class QueryHistoryItem(BaseModel):
    id: str
    thread_id: str | None = None
    kind: str          # "query" or "feedback"
    text: str
    status: str        # "accepted" or "blocked"
    created_at: str
    plan_id: str | None = None   # set when this query produced an approved, saved plan