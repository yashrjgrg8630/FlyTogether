import { useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { PageSkeleton } from "./PageSkeleton";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sent = useRef(false);
  useEffect(() => {
    if (!ready || isAuthenticated || sent.current || location.pathname === "/login") return;
    sent.current = true;
    navigate({ to: "/login", search: { redirect: location.href }, replace: true });
  }, [ready, isAuthenticated, navigate, location.href, location.pathname]);
  if (!ready || !isAuthenticated) return <PageSkeleton />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && isAuthenticated && !isAdmin) navigate({ to: "/forbidden", replace: true });
  }, [ready, isAuthenticated, isAdmin, navigate]);
  return <ProtectedRoute>{isAdmin ? children : <PageSkeleton />}</ProtectedRoute>;
}
