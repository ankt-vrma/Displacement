import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Field({ label, hint, type = "text", className = "", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className={`input ${isPassword ? "pr-12" : ""} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ children }) {
  return (
    <p role="alert" className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent-2">
      {children}
    </p>
  );
}