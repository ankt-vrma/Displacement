import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { plansApi } from "../lib/api";
import { useAuth } from "./AuthContext";

const PlanContext = createContext(null);
const KEY = "dp_session";

const toSession = (r, extra = {}) => ({
  threadId: r.thread_id,
  status: r.status, // "awaiting_review" | "completed"
  trip: r.trip ?? {},
  draftPlan: r.draft_plan ?? "",
  agents: r.selected_agents ?? [],
  revisions: r.revision_count ?? 0,
  ...extra,
});

export function PlanProvider({ children }) {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(null); // "planning" | "refining" | "approving"
  const [error, setError] = useState("");

  // Restore the current session after a page refresh (or clear it on logout).
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(KEY);
      setSession(null);
      return;
    }
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(KEY)); } catch { saved = null; }
    if (!saved?.threadId) return;
    plansApi
      .get(saved.threadId)
      .then((r) => setSession(toSession(r, { planId: saved.planId, query: saved.query })))
      .catch(() => sessionStorage.removeItem(KEY));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (session) {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ threadId: session.threadId, planId: session.planId, query: session.query })
      );
    }
  }, [session]);

  const startPlan = useCallback(async (query) => {
    setBusy("planning");
    setError("");
    try {
      setSession(toSession(await plansApi.create(query), { query }));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(null);
    }
  }, []);

  const refine = useCallback(
    async (feedback) => {
      setBusy("refining");
      setError("");
      try {
        const r = await plansApi.feedback(session.threadId, feedback);
        setSession((prev) => toSession(r, { query: prev.query, planId: prev.planId }));
        return true;
      } catch (e) {
        setError(e.message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [session?.threadId]
  );

  const approve = useCallback(async () => {
    setBusy("approving");
    setError("");
    try {
      const r = await plansApi.approve(session.threadId);
      setSession((prev) => ({
        ...prev,
        status: "completed",
        draftPlan: r.final_plan,
        planId: r.plan_id,
      }));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(null);
    }
  }, [session?.threadId]);

  const loadResponse = useCallback((resp, extra) => {
    setError("");
    setSession(toSession(resp, extra));
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setSession(null);
    setError("");
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const value = useMemo(
    () => ({ session, busy, error, startPlan, refine, approve, loadResponse, reset, clearError }),
    [session, busy, error, startPlan, refine, approve, loadResponse, reset, clearError]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export const usePlan = () => useContext(PlanContext);