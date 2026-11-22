import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import HistoryDetail from "../components/HistoryDetail";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import { ErrorNote } from "../components/Field";
import { plansApi } from "../lib/api";
import { formatDateTime } from "../lib/format";

const PAGE = 20;
const fetchPage = (offset) => plansApi.history({ kind: "query", limit: PAGE, offset });

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchPage(0)
      .then((rows) => { if (alive) { setItems(rows); setHasMore(rows.length === PAGE); } })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const rows = await fetchPage(items.length);
      setItems((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">History</p>
      <h1 className="mt-3 text-5xl leading-[1.02] sm:text-7xl">Past queries.</h1>
      <p className="mt-4 max-w-xl text-ink-2">Everything you’ve asked. Open any entry to see the plan, or download its PDF.</p>

      <div className="mt-12">
        {error && <div className="mb-6"><ErrorNote>{error}</ErrorNote></div>}

        {loading ? (
          <div className="space-y-px">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse border-t border-line bg-paper-2/50" />)}
          </div>
        ) : items.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-line py-20 text-center">
            <p className="font-display text-4xl">No queries yet.</p>
            <p className="mt-3 text-ink-2">Your first search will show up here.</p>
            <Link to="/search" className="btn btn-primary mt-7">Make a query <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <ul className="border-b border-line">
            {items.map((item) => (
              <li key={item.id} className="border-t border-line">
                <button
                  onClick={() => setSelected(item)}
                  className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 px-2 py-5 text-left transition hover:bg-card sm:grid-cols-[9.5rem_1fr_auto_auto] sm:gap-6 sm:px-4"
                >
                  <span className="hidden font-mono text-[11px] uppercase tracking-[0.1em] text-muted sm:block">
                    {formatDateTime(item.created_at)}
                  </span>
                  <span className="line-clamp-2 text-[15.5px] leading-snug text-ink">{item.text}</span>
                  <span className="hidden sm:block"><StatusBadge item={item} /></span>
                  <ChevronRight size={18} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="mt-8 text-center">
            <button onClick={loadMore} disabled={loadingMore} className="btn btn-ghost">
              {loadingMore ? <Spinner /> : null} Load more
            </button>
          </div>
        )}
      </div>

      {selected && <HistoryDetail item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}