import { NavLink } from "react-router-dom";
import { FileText, Globe, History as HistoryIcon, Search as SearchIcon, User } from "lucide-react";
import Logo from "./Logo";
import { usePlan } from "../context/PlanContext";

const TABS = [
  { to: "/search", label: "Search", icon: SearchIcon },
  { to: "/result", label: "Result", icon: FileText },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/explore", label: "Explore", icon: Globe },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const { session } = usePlan();
  const pending = session?.status === "awaiting_review";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo hideText />
        <nav className="flex items-center gap-1" aria-label="Main">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                `relative flex items-center gap-2 rounded-full px-3 py-2 text-sm transition sm:px-4 ${
                  isActive ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">{label}</span>
              {to === "/result" && pending && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-accent ring-2 ring-paper" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}