import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
export function Forbidden() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20">
      <EmptyState
        icon={ShieldAlert}
        title="403 · Admins only"
        description="Your account doesn't have access to this area."
        action={
          <Button variant="hero" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
