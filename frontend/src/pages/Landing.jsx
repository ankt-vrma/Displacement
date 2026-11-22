import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  { n: "01", title: "Ask in plain words", text: "Type the trip the way you’d say it. Dates, budget and preferences are picked out for you." },
  { n: "02", title: "Specialists get to work", text: "A supervisor decides which of five specialists your question needs. They run in parallel on live data." },
  { n: "03", title: "Shape the draft", text: "Ask for changes, up to five rounds. Only the parts that need to change are redone." },
  { n: "04", title: "Take it with you", text: "Approve it and download a clean PDF. Every plan stays in your history." },
];

const SPECIALISTS = [
  { name: "Flights", text: "Looks up scheduled flights on your route and estimates fares from the web.", source: "Aviationstack · Tavily" },
  { name: "Hotels", text: "Finds stays across budget tiers, with the area, a nightly price and why each one fits.", source: "Tavily" },
  { name: "Weather", text: "Reads the forecast for your dates and tells you what to pack and when to head out.", source: "WeatherAPI" },
  { name: "Budget", text: "Adds it all up (travel, stay, food, transport, a buffer) against what you want to spend.", source: "Built from the above" },
  { name: "Itinerary", text: "Turns everything into a day-by-day plan that respects the weather and the budget.", source: "Built from the above" },
];

function RouteArc() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 1200 700" preserveAspectRatio="none" fill="none">
      <path
        d="M-20 640 C 260 120, 760 40, 1220 240"
        stroke="currentColor"
        className="text-line"
        strokeWidth="1.5"
        strokeDasharray="6 8"
        vectorEffect="non-scaling-stroke"
        style={{ animation: "dash 3s linear infinite" }}
      />
    </svg>
  );
}

function BoardingPass() {
  return (
    <div className="relative mx-auto max-w-md -rotate-2 transition duration-500 hover:rotate-0">
      <div className="card relative overflow-hidden shadow-[0_30px_70px_-35px_rgba(50,35,10,0.55)]">
        <div className="flex items-center justify-between bg-forest px-6 py-3 text-paper">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Trip brief</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">Sample</span>
        </div>

        <div className="px-6 pt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-display text-6xl leading-none">DEL</p>
              <p className="mt-1 text-sm text-muted">Delhi</p>
            </div>
            <div className="mb-4 flex-1 px-4">
              <div className="relative border-t border-dashed border-ink/40">
                <span className="absolute -right-1 -top-[5px] size-2.5 rounded-full bg-accent" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-6xl leading-none">GOI</p>
              <p className="mt-1 text-sm text-muted">Goa</p>
            </div>
          </div>
        </div>

        <div className="relative my-6">
          <div className="border-t border-dashed border-line" />
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-paper" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-paper" />
        </div>

        <div className="grid grid-cols-3 gap-4 px-6">
          {[["Length", "5 days"], ["When", "December"], ["Budget", "INR 40,000"]].map(([k, v]) => (
            <div key={k}>
              <p className="eyebrow">{k}</p>
              <p className="mt-1 text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line px-6 py-5">
          {["Flights", "Hotels", "Weather", "Budget", "Itinerary"].map((s) => (
            <span key={s} className="chip gap-1.5"><Check size={11} strokeWidth={2.5} className="text-forest" />{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-6">
          <a href="#how" className="hidden text-sm text-ink-2 transition hover:text-ink md:block">How it works</a>
          <a href="#specialists" className="hidden text-sm text-ink-2 transition hover:text-ink md:block">Specialists</a>
          {user ? (
            <Link to="/search" className="btn btn-primary">Open the app <ArrowRight size={15} /></Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm text-ink-2 transition hover:text-ink">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 lg:pt-20">
        <RouteArc />
        <div className="relative grid items-center gap-16 lg:grid-cols-12">
          <div className="rise lg:col-span-7">
            <p className="eyebrow">Agentic AI travel planner</p>
            <h1 className="mt-6 text-[clamp(3.2rem,8.5vw,7rem)] leading-[0.92]">
              Describe the trip.
              <br />
              <span className="italic text-accent">We’ll plan the rest.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-2">
              Displacement is an agentic AI travel planner. Specialist agents check real flight
              schedules, hotels, weather and costs, then hand you a draft you can reshape until it
              feels right.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/search" className="btn btn-accent">Plan a trip <ArrowRight size={16} /></Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-accent">Create your account <ArrowRight size={16} /></Link>
                  <Link to="/login" className="btn btn-ghost">I already have one</Link>
                </>
              )}
            </div>
          </div>
          <div className="rise lg:col-span-5" style={{ animationDelay: "140ms" }}>
            <BoardingPass />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20 sm:px-8">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-4 max-w-2xl text-5xl leading-[1.02] sm:text-6xl">From one sentence to a finished plan.</h2>
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink pt-5">
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h3 className="mt-4 text-3xl leading-tight">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialists */}
      <section id="specialists" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-12">
              <p className="eyebrow">Five specialists</p>
              <h2 className="mt-4 text-5xl leading-[1.02] sm:text-6xl">One question, only the experts it needs.</h2>
              <p className="mt-6 text-ink-2">
                Ask about hotels and only the hotel specialist works. Ask for a full trip and all
                five collaborate.
              </p>
            </div>
          </div>
          <ul className="lg:col-span-8">
            {SPECIALISTS.map((s, i) => (
              <li key={s.name} className="grid gap-3 border-t border-line py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline sm:gap-8">
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <div>
                  <h3 className="text-4xl leading-none">{s.name}</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-2">{s.text}</p>
                </div>
                <span className="chip self-start">{s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Control */}
      <section className="bg-forest text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">You stay in control</p>
            <h2 className="mt-4 text-5xl leading-[1.02] sm:text-6xl">Nothing is final until you say so.</h2>
            <p className="mt-6 max-w-lg leading-relaxed text-paper/75">
              Every plan arrives as a draft. Tell it what to change and it re-runs only the
              specialists affected, keeping everything else exactly as it was. When it’s right,
              approve it and get your PDF.
            </p>
          </div>
          <div className="rounded-2xl border border-paper/15 bg-forest-2/50 p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Example</p>
            <div className="mt-5 rounded-xl bg-paper px-5 py-4 text-ink">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Your feedback</p>
              <p className="mt-1.5">Cheaper hotels near the beach, and add a day trip.</p>
            </div>
            <div className="mt-4 rounded-xl border border-paper/20 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Draft updated</p>
              <p className="mt-1.5 text-paper/85">Only the parts affected by your note are regenerated. The rest stays put.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-28 text-center sm:px-8">
        <h2 className="text-[clamp(3rem,8vw,6.5rem)] leading-[0.95]">Where to next?</h2>
        <p className="mx-auto mt-6 max-w-md text-ink-2">Create a free account and plan your first trip in a couple of minutes.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link to="/search" className="btn btn-accent">Plan a trip <ArrowRight size={16} /></Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-accent">Get started <ArrowRight size={16} /></Link>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <Logo />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Built with FastAPI · LangGraph · React</p>
        </div>
      </footer>
    </div>
  );
}