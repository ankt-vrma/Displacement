import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { FullPageLoader } from "./Guards";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <div key={location.pathname} className="rise">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-line py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        Displacement · Agentic AI travel planner
      </footer>
    </div>
  );
}