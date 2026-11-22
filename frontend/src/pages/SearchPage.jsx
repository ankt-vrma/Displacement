import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import WorkingPanel from "../components/WorkingPanel";
import { ErrorNote } from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../context/PlanContext";

const SECTIONS = [
  { n: "01", title: "Flights", text: "Scheduled flights on your route, with estimated fares." },
  { n: "02", title: "Hotels", text: "Stays across budget tiers, with area and nightly price." },
  { n: "03", title: "Weather", text: "The forecast for your dates, plus what to pack." },
  { n: "04", title: "Budget", text: "An itemised cost estimate against what you want to spend." },
  { n: "05", title: "Itinerary", text: "A day-by-day plan: morning, afternoon and evening." },
];

const EXAMPLES = [
  "Plan a 5 day trip from Delhi to Goa in December under 40000 INR",
  "A relaxed 3 day weekend in Jaipur for two, heritage hotels",
  "Find me flights from Mumbai to Bangkok next month",
  "What’s the weather like in Manali in January? I want to go skiing",
];

const MIN = 10;
const MAX = 1000;

export default function SearchPage() {
  const { user } = useAuth();
  const { startPlan, busy, error, clearError } = usePlan();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const planning = busy === "planning";
  const valid = query.trim().length >= MIN;
  const first = user?.full_name?.trim().split(" ")[0];

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || planning) return;
    if (await startPlan(query.trim())) navigate("/result");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Search</p>
      <h1 className="mt-3 text-5xl leading-[1.02] sm:text-7xl">Where to{first ? `, ${first}` : ""}?</h1>

      {/* What the result looks like */}
      <section className="mt-14" aria-labelledby="format-heading">
        <h2 id="format-heading" className="eyebrow">What you’ll get back</h2>
        <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {SECTIONS.map((s) => (
            <div key={s.n} className="border-t border-ink pt-4">
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h3 className="mt-2 text-2xl leading-tight">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-2">
          You only get the sections your question needs. Ask about hotels alone and that’s all
          that’s generated. You can then refine the draft before it’s finalised as a PDF.
        </p>
      </section>

      {/* Composer */}
      <section className="mt-14">
        {planning ? (
          <div className="card">
            <WorkingPanel title="Planning your trip" />
          </div>
        ) : (
          <form onSubmit={submit} className="card p-5 shadow-[0_24px_60px_-35px_rgba(60,45,20,0.4)] sm:p-7">
            <label htmlFor="query" className="eyebrow">Your trip, in your own words</label>
            <textarea
              id="query"
              rows={4}
              maxLength={MAX}
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (error) clearError(); }}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(e); }}
              placeholder="Plan me a 5 day trip from Delhi to Goa in December under 40000 INR…"
              className="mt-3 w-full resize-none bg-transparent font-display text-3xl leading-snug outline-none placeholder:text-muted/60"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setQuery(ex)}
                  className="chip cursor-pointer text-left transition hover:border-ink hover:text-ink"
                >
                  {ex}
                </button>
              ))}
            </div>

            {error && <div className="mt-5"><ErrorNote>{error}</ErrorNote></div>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <p className="max-w-sm text-xs text-muted">
                {user?.home_airport_iata
                  ? `Your home airport (${user.home_airport_iata}) is used as the default departure.`
                  : "Tip: set a home airport in Profile to skip typing your departure city."}
                <span className="ml-2 font-mono">{query.length}/{MAX}</span>
              </p>
              <button type="submit" disabled={!valid} className="btn btn-accent px-6 py-3">
                Plan my trip <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}