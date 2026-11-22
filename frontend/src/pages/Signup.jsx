import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Field, { ErrorNote } from "../components/Field";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      return setError({ message: "Password must be at least 8 characters." });
    }
    setBusy(true);
    try {
      await register(form.name.trim() || null, form.email.trim(), form.password);
      navigate("/search", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Start planning."
      subtitle="Create your account to save plans and pick up where you left off."
      footer={<>Already registered? <Link to="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" autoComplete="name" placeholder="Ankit Sharma" value={form.name} onChange={set("name")} />
        <Field label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={set("email")} />
        <Field label="Password" type="password" autoComplete="new-password" required hint="At least 8 characters." value={form.password} onChange={set("password")} />

        {error && (
          <ErrorNote>
            {error.message}{" "}
            {error.status === 409 && (
              <Link to="/login" className="font-medium underline underline-offset-4">Log in instead</Link>
            )}
          </ErrorNote>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
          {busy ? <Spinner /> : <>Create account <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthShell>
  );
}