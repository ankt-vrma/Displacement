import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Field, { ErrorNote } from "../components/Field";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/search", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Log in to see your plans and keep planning."
      footer={<>New here? <Link to="/signup" className="font-medium text-ink underline underline-offset-4 hover:text-accent">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={set("email")} />
        <Field label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={set("password")} />
        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
          {busy ? <Spinner /> : <>Log in <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthShell>
  );
}