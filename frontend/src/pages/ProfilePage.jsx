import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Pencil } from "lucide-react";
import Field, { ErrorNote } from "../components/Field";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { formatDate, initials } from "../lib/format";

function Detail({ label, children }) {
  return (
    <div className="border-t border-line py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-[15px]">{children || <span className="text-muted">Not set</span>}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const interests = user.travel_preferences?.interests ?? [];
  const [form, setForm] = useState({
    name: user.full_name ?? "",
    city: user.home_city ?? "",
    airport: user.home_airport_iata ?? "",
    currency: user.preferred_currency ?? "",
    interests: interests.join(", "),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const airport = form.airport.trim();
    const currency = form.currency.trim();
    if (airport && !/^[A-Za-z]{3}$/.test(airport)) return setError("Airport code must be 3 letters, e.g. DEL.");
    if (currency && !/^[A-Za-z]{3}$/.test(currency)) return setError("Currency must be a 3-letter code, e.g. INR.");

    setBusy(true);
    try {
      await updateProfile({
        full_name: form.name.trim() || null,
        home_city: form.city.trim() || null,
        home_airport_iata: airport || null,
        preferred_currency: currency || null,
        travel_preferences: {
          ...(user.travel_preferences ?? {}),
          interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Profile</p>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="grid size-24 shrink-0 place-items-center rounded-full bg-forest font-display text-4xl text-paper">
          {initials(user)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-5xl leading-[1.02] sm:text-6xl">{user.full_name || "Traveller"}</h1>
          <p className="mt-2 font-mono text-sm text-ink-2">{user.email}</p>
        </div>
      </div>

      <section className="card mt-12 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl">Details</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-ghost px-4 py-2">
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="mt-6 space-y-4">
            <Field label="Full name" value={form.name} onChange={set("name")} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Home city" placeholder="Delhi" value={form.city} onChange={set("city")} />
              <Field label="Home airport" placeholder="DEL" maxLength={3} value={form.airport} onChange={set("airport")} />
              <Field label="Currency" placeholder="INR" maxLength={3} value={form.currency} onChange={set("currency")} />
            </div>
            <Field
              label="Interests"
              placeholder="beaches, food, heritage"
              hint="Comma separated. Used as defaults when you plan a trip."
              value={form.interests}
              onChange={set("interests")}
            />
            {error && <ErrorNote>{error}</ErrorNote>}
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={busy} className="btn btn-primary">{busy ? <Spinner /> : null} Save changes</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setError(""); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <dl className="mt-4 grid sm:grid-cols-2 sm:gap-x-10">
            <Detail label="Member since">{formatDate(user.created_at)}</Detail>
            <Detail label="Role"><span className="capitalize">{user.role}</span></Detail>
            <Detail label="Home city">{user.home_city}</Detail>
            <Detail label="Home airport">{user.home_airport_iata}</Detail>
            <Detail label="Currency">{user.preferred_currency}</Detail>
            <Detail label="Interests">
              {interests.length > 0 && (
                <span className="flex flex-wrap gap-1.5">
                  {interests.map((i) => <span key={i} className="chip">{i}</span>)}
                </span>
              )}
            </Detail>
          </dl>
        )}
      </section>

      <div className="mt-8 flex justify-end">
        <button onClick={doLogout} className="btn btn-ghost">
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}