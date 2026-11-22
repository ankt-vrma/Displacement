export function statusOf(item) {
  if (item.status === "blocked") return "blocked";
  if (item.plan_id) return "approved";
  return "draft";
}

const STYLES = {
  approved: { label: "Approved", cls: "border-forest/25 bg-forest/10 text-forest" },
  draft: { label: "Not approved", cls: "border-line bg-paper-2 text-ink-2" },
  blocked: { label: "Blocked", cls: "border-accent/30 bg-accent/10 text-accent-2" },
};

export default function StatusBadge({ item }) {
  const { label, cls } = STYLES[statusOf(item)];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] ${cls}`}>
      {label}
    </span>
  );
}