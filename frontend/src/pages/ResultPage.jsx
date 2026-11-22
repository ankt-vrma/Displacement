import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Download, FileText } from "lucide-react";
import Markdown, { stripTitle } from "../components/Markdown";
import Spinner from "../components/Spinner";
import WorkingPanel from "../components/WorkingPanel";
import { ErrorNote } from "../components/Field";
import { usePlan } from "../context/PlanContext";
import { downloadPdf, plansApi } from "../lib/api";
import { AGENT_LABELS, planFilename, tripFacts } from "../lib/format";

const MAX_REVISIONS = 5;

const REFINE_PHASES = ["Reading your feedback", "Choosing which specialists to re-run", "Updating the draft"];
const APPROVE_PHASES = ["Locking in your plan", "Laying out the document", "Saving it to your account"];

function EmptyResult() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-full border border-line bg-card text-muted">
        <FileText size={22} strokeWidth={1.5} />
      </div>
      <h1 className="mt-8 text-5xl leading-[1.02]">Nothing here yet.</h1>
      <p className="mt-4 text-ink-2">Make a query first. Your plan will appear on this page, ready to refine.</p>
      <Link to="/search" className="btn btn-primary mt-8">
        Go to Search <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default function ResultPage() {
  const { session, busy, error, refine, approve, reset, clearError } = usePlan();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState("");

  if (!session) return <EmptyResult />;

  const trip = session.trip ?? {};
  const final = session.status === "completed";
  const working = busy === "refining" || busy === "approving";
  const outOfRevisions = session.revisions >= MAX_REVISIONS;
  const facts = tripFacts(trip);
  const { origin, destination } = trip;

  const submitFeedback = async (e) => {
    e.preventDefault();
    const text = feedback.trim();
    if (text.length < 3 || working || outOfRevisions) return;
    if (await refine(text)) setFeedback("");
  };

  const download = async () => {
    setDownloading(true);
    setDlError("");
    try {
      // Fetch a fresh signed link each time. They expire after an hour.
      const saved = await plansApi.saved(session.planId);
      await downloadPdf(saved.pdf_url, planFilename(trip));
    } catch (e) {
      setDlError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  const startOver = () => {
    reset();
    navigate("/search");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="eyebrow">
          {final ? "Final plan" : `Draft · refinement ${session.revisions} of ${MAX_REVISIONS}`}
        </p>
        <h1 className="mt-3 flex flex-wrap items-center gap-x-4 text-5xl leading-[1.02] sm:text-6xl">
          {origin && destination ? (
            <>
              <span>{origin}</span>
              <ArrowRight className="size-9 shrink-0 text-accent" strokeWidth={1.25} />
              <span>{destination}</span>
            </>
          ) : (
            <span>{destination || origin || "Your trip"}</span>
          )}
        </h1>
        {session.query && (
          <p className="mt-5 max-w-2xl font-display text-xl italic leading-snug text-ink-2">“{session.query}”</p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {facts.map((f) => <span key={f} className="chip">{f}</span>)}
          {session.agents.map((a) => (
            <span key={a} className="chip border-forest/25 bg-forest/10 text-forest">{AGENT_LABELS[a] ?? a}</span>
          ))}
        </div>
      </header>

      <section className="card relative mt-10 p-6 shadow-[0_24px_60px_-35px_rgba(60,45,20,0.4)] sm:p-10">
        <Markdown>{stripTitle(session.draftPlan)}</Markdown>
        {working && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-card/90 backdrop-blur-[2px]">
            {busy === "refining"
              ? <WorkingPanel title="Refining your plan" phases={REFINE_PHASES} />
              : <WorkingPanel title="Creating your PDF" phases={APPROVE_PHASES} />}
          </div>
        )}
      </section>

      {/* Bottom area */}
      {final ? (
        <div className="mt-6 overflow-hidden rounded-2xl bg-forest text-paper">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/55">Plan approved</p>
              <p className="mt-1 font-display text-4xl leading-tight">
                {session.planId ? "Your PDF is ready." : "One step left."}
              </p>
              <p className="mt-1 text-sm text-paper/70">
                {session.planId ? "It’s saved to your history, too." : "Create the PDF to save this plan."}
              </p>
              {(dlError || error) && <p className="mt-3 text-sm text-accent/90 [&]:text-[#ffb4a3]">{dlError || error}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {session.planId ? (
                <button onClick={download} disabled={downloading} className="btn bg-paper text-ink hover:bg-white">
                  {downloading ? <Spinner /> : <Download size={16} />} Download PDF
                </button>
              ) : (
                <button onClick={approve} disabled={busy === "approving"} className="btn bg-paper text-ink hover:bg-white">
                  {busy === "approving" ? <Spinner /> : <Download size={16} />} Create PDF
                </button>
              )}
              <button onClick={startOver} className="btn border border-paper/30 text-paper hover:bg-paper/10">
                Plan another trip
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {error && <div className="mt-6"><ErrorNote>{error}</ErrorNote></div>}
          <form
            onSubmit={submitFeedback}
            className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-ink/15 bg-card/95 p-3 shadow-[0_20px_50px_-20px_rgba(40,30,10,0.45)] backdrop-blur"
          >
            <label htmlFor="feedback" className="sr-only">Refine this plan</label>
            <textarea
              id="feedback"
              rows={2}
              maxLength={1000}
              value={feedback}
              disabled={working || outOfRevisions}
              onChange={(e) => { setFeedback(e.target.value); if (error) clearError(); }}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitFeedback(e); }}
              placeholder="Ask for changes or more detail, e.g. cheaper hotels near the beach, or add a day trip."
              className="w-full resize-none bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-muted disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 pt-3">
              <p className="font-mono text-[11px] text-muted">
                {outOfRevisions
                  ? "Refinement limit reached. Approve to finish."
                  : `${MAX_REVISIONS - session.revisions} refinements left`}
              </p>
              <div className="flex items-center gap-2">
                <button type="submit" className="btn btn-ghost" disabled={working || outOfRevisions || feedback.trim().length < 3}>
                  Refine
                </button>
                <button type="button" onClick={approve} className="btn btn-accent" disabled={working}>
                  {busy === "approving" ? <><Spinner /> Creating PDF…</> : <>Approve &amp; create PDF <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}