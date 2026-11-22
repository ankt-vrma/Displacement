import { Navigate } from "react-router-dom";
import { LogoMark } from "./Logo";
import { useAuth } from "../context/AuthContext";

export function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <LogoMark size={40} className="animate-pulse text-forest" />
    </div>
  );
}

/** Login / signup: bounce already-signed-in users into the app. */
export function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/search" replace />;
  return children;
}