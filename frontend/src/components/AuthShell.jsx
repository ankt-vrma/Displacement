import Logo from "./Logo";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="rise mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
          <p className="mt-3 text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-sm text-ink-2">{footer}</div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-forest text-paper lg:block">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
          <g stroke="currentColor" className="text-paper/15" strokeWidth="1">
            <circle cx="120" cy="640" r="90" />
            <circle cx="120" cy="640" r="190" />
            <circle cx="120" cy="640" r="300" />
            <circle cx="120" cy="640" r="420" />
          </g>
          <path
            d="M120 640 C 240 420, 380 300, 500 150"
            stroke="currentColor"
            className="text-paper/60"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            style={{ animation: "dash 3s linear infinite" }}
          />
          <circle cx="120" cy="640" r="6" fill="currentColor" className="text-paper" />
          <circle cx="500" cy="150" r="9" fill="currentColor" className="text-accent" />
          <circle cx="500" cy="150" r="20" stroke="currentColor" className="text-accent/50" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
            displacement · noun
          </p>
          <p className="mt-4 max-w-md font-display text-4xl leading-tight">
            The straight line between where you are and where you want to be.
          </p>
        </div>
      </aside>
    </div>
  );
}