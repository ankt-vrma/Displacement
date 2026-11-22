from uuid import UUID, uuid4
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from langgraph.types import Command

from app.api.deps import get_current_user
from app.graph.workflow import graph
from app.guardrails_layer.query_guard import check_query
from app.schemas.plan import (
    FeedbackRequest,
    FinalPlanResponse,
    PlanRequest,
    PlanResponse,
    SavedPlan,
    SavedPlanSummary,
    QueryHistoryItem
)
from app.services import supabase_service, history_service
from app.services.pdf_service import markdown_to_pdf

router = APIRouter(prefix="/plans", tags=["plans"])

MAX_REVISIONS = 5


def _cfg(thread_id: str) -> dict:
    return {"configurable": {"thread_id": thread_id}}


def _profile_context(user: dict) -> dict:
    keys = ("home_city", "home_airport_iata", "preferred_currency", "travel_preferences")
    return {k: user[k] for k in keys if user.get(k)}


async def _snapshot(thread_id: str, user: dict):
    snap = await graph.aget_state(_cfg(thread_id))
    # Same 404 for "doesn't exist" and "belongs to someone else", so ids can't be probed.
    if not snap.values or snap.values.get("user_id") != user["id"]:
        raise HTTPException(404, "Plan session not found")
    return snap


async def _to_response(thread_id: str, user: dict) -> PlanResponse:
    snap = await _snapshot(thread_id, user)
    v = snap.values
    return PlanResponse(
        thread_id=thread_id,
        status="awaiting_review" if snap.next else "completed",
        selected_agents=v.get("selected_agents", []),
        trip=v.get("trip", {}),
        draft_plan=v.get("draft_plan", ""),
        revision_count=v.get("revision_count", 0),
    )


@router.post("", response_model=PlanResponse)
async def create_plan(body: PlanRequest, user: dict = Depends(get_current_user)):
    verdict = check_query(body.query)
    if not verdict.allowed:
        await history_service.log_query(user["id"], body.query, "query", "blocked")
        raise HTTPException(400, verdict.reason)

    thread_id = str(uuid4())
    await history_service.log_query(user["id"], body.query, "query", "accepted", thread_id)
    await graph.ainvoke(
        {
            "query": body.query,
            "revision_count": 0,
            "user_id": user["id"],
            "profile": _profile_context(user),
        },
        _cfg(thread_id),
    )
    return await _to_response(thread_id, user)


# --- saved plans (declared before /{thread_id} so "saved" isn't read as a thread id) ---
@router.get("/saved", response_model=list[SavedPlanSummary])
async def list_saved_plans(user: dict = Depends(get_current_user)):
    return await supabase_service.list_plans(user["id"])


@router.get("/saved/{plan_id}", response_model=SavedPlan)
async def get_saved_plan(plan_id: UUID, user: dict = Depends(get_current_user)):
    row = await supabase_service.get_plan(str(plan_id), user["id"])
    if not row:
        raise HTTPException(404, "Plan not found")
    return row


@router.delete("/saved/{plan_id}", status_code=204)
async def delete_saved_plan(plan_id: UUID, user: dict = Depends(get_current_user)):
    if not await supabase_service.delete_plan(str(plan_id), user["id"]):
        raise HTTPException(404, "Plan not found")

@router.get("/history", response_model=list[QueryHistoryItem])
async def my_query_history(
    kind: Literal["query", "feedback"] | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    return await history_service.list_queries(user["id"], limit, offset, kind)


# --- active planning sessions ---
@router.get("/{thread_id}", response_model=PlanResponse)
async def get_draft(thread_id: str, user: dict = Depends(get_current_user)):
    return await _to_response(thread_id, user)


@router.post("/{thread_id}/feedback", response_model=PlanResponse)
async def refine_plan(thread_id: str, body: FeedbackRequest, user: dict = Depends(get_current_user)):
    verdict = check_query(body.feedback)
    if not verdict.allowed:
        await history_service.log_query(user["id"], body.feedback, "feedback", "blocked", thread_id)
        raise HTTPException(400, verdict.reason)

    snap = await _snapshot(thread_id, user)
    if "human_review" not in snap.next:
        raise HTTPException(409, "This plan is not awaiting review")
    if snap.values.get("revision_count", 0) >= MAX_REVISIONS:
        raise HTTPException(409, "Revision limit reached, please approve the plan")

    await history_service.log_query(user["id"], body.feedback, "feedback", "accepted", thread_id)
    await graph.ainvoke(
        Command(resume={"action": "revise", "feedback": body.feedback}), _cfg(thread_id)
    )
    return await _to_response(thread_id, user)


@router.post("/{thread_id}/approve", response_model=FinalPlanResponse)
async def approve_plan(thread_id: str, user: dict = Depends(get_current_user)):
    snap = await _snapshot(thread_id, user)

    if "human_review" in snap.next:
        await graph.ainvoke(Command(resume={"action": "approve"}), _cfg(thread_id))
        snap = await _snapshot(thread_id, user)
    elif not snap.values.get("final_plan"):
        raise HTTPException(409, "This plan is not awaiting review")

    values = snap.values
    final_plan = values["final_plan"]
    trip = values.get("trip", {})
    title = f"Travel Plan: {trip.get('origin') or ''} to {trip.get('destination') or ''}"
    pdf_bytes = markdown_to_pdf(title, final_plan)

    row = await supabase_service.save_plan(
        user["id"], thread_id, values["query"], trip, final_plan, pdf_bytes
    )
    return FinalPlanResponse(
        plan_id=row["id"], thread_id=thread_id, pdf_url=row.get("pdf_url"), final_plan=final_plan
    )