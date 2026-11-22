import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Download, X } from "lucide-react";
import Markdown, { stripTitle } from "./Markdown";
import Spinner from "./Spinner";
import StatusBadge from "./StatusBadge";
import { usePlan } from "../context/PlanContext";
import { downloadPdf, plansApi } from "../lib/api";
import { formatDateTime, planFilename, tripFacts } from "../lib/format";

export default function HistoryDetail({ item, onClose }) {
  const navigate = useNavigate();
  const { loadResponse } = usePlan();
  const [state, setState] = useState({ kind: "loading" });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;
    const set = (s) => alive && setState(s);
    setState({ kind: "loading" });

    (async () => {
      try {
        if (item.status === "blocked") return set({ kind: "blocked" });
        if (item.plan_id) return set({ kind: "saved", data: await plansApi.saved(item.plan_id) });
        if (item.thread_id) return set({ kind: "draft", data: await plansApi.get(item.thread_id) });
        set({ kind: "gone" });
      } catch (e) {
        set(e.status === 404 ? { kind: "gone" } : { kind: "error", message: e.message });
      }
    })();

    return () => { alive = false; };
  }, [item]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadPdf(state.data.pdf_url, planFilename(state.data.trip));
    } finally {
      setDownloading(false);
    }
  };

  const continueEditing = () => {
    loadResponse(state.data, { query: item.text });
    onClose();
    navigate("/result");
  };

  const facts = state.kind === "saved" ? tripFacts(state.data.trip ?? {}) : [];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Query details">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-line bg-paper shadow-2xl"
        style={{ animation: "slide-in 0.35s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <StatusBadge item={item} />
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink-2 transition hover:bg-paper-2 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <p className="eyebrow">{formatDateTime(item.created_at)}</p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{item.text}</h2>

          {facts.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {facts.map((f) => <span key={f} className="chip">{f}</span>)}
            </div>
          )}

          <div className="mt-8 border-t border-line pt-8">
            {state.kind === "loading" && (
              <p className="flex items-center gap-3 text-sm text-muted"><Spinner /> Loading details…</p>
            )}
            {state.kind === "blocked" && (
              <p className="text-ink-2">This query was stopped by the safety filter, so no plan was created.</p>
            )}
            {state.kind === "gone" && (
              <p className="text-ink-2">
                The draft for this query is no longer available. Unapproved drafts are cleared when the server restarts.
              </p>
            )}
            {state.kind === "error" && <p className="text-accent-2">{state.message}</p>}
            {state.kind === "saved" && <Markdown>{stripTitle(state.data.final_plan)}</Markdown>}
            {state.kind === "draft" && (
              <>
                <p className="mb-6 rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink-2">
                  This plan was never approved. You can pick up where you left off.
                </p>
                <Markdown>{stripTitle(state.data.draft_plan)}</Markdown>
              </>
            )}
          </div>
        </div>

        {state.kind === "saved" && (
          <div className="border-t border-line bg-card px-6 py-4 sm:px-8">
            <button onClick={download} disabled={downloading} className="btn btn-accent w-full">
              {downloading ? <Spinner /> : <Download size={16} />} Download PDF
            </button>
          </div>
        )}
        {state.kind === "draft" && (
          <div className="border-t border-line bg-card px-6 py-4 sm:px-8">
            <button onClick={continueEditing} className="btn btn-primary w-full">
              Continue in Result <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}