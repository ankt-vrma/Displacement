import { useEffect, useState } from "react";

const DEFAULT_PHASES = [
  "Reading your request",
  "Routing it to the right specialists",
  "Specialists are gathering data",
  "Putting the draft together",
];

// The backend doesn't stream progress yet, so these phases are a gentle visual
// cue on a timer, not a live status feed.
export default function WorkingPanel({ title = "Working on it", phases = DEFAULT_PHASES }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, phases.length - 1)), 3500);
    return () => clearInterval(t);
  }, [phases.length]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10 text-center" role="status" aria-live="polite">
      <p className="eyebrow">{title}</p>
      <div className="relative mx-auto my-8 h-6 w-full max-w-xs">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-ink/30" />
        <span className="absolute left-0 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
        <span className="absolute right-0 top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-ink bg-card" />
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ animation: "route-dot 2.4s ease-in-out infinite" }}
        />
      </div>
      <p key={i} className="rise font-display text-3xl leading-tight">
        {phases[i]}…
      </p>
      <p className="mt-3 text-sm text-muted">Hang tight, this can take a little while.</p>
    </div>
  );
}