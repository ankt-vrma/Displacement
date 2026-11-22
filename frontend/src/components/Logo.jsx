import { Link } from "react-router-dom";

export function LogoMark({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="7" cy="25" r="3" fill="currentColor" />
      <path d="M9.5 22.5 24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 7.5h8.5V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ hideText = false, className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Displacement home">
      <LogoMark />
      <span className={`font-display text-[26px] leading-none ${hideText ? "hidden sm:inline" : ""}`}>
        Displacement
      </span>
    </Link>
  );
}