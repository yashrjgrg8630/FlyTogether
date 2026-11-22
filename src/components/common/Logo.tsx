import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Plane className="size-4 -rotate-45" />
      </span>
      Fly<span className="text-coral">Together</span>
    </Link>
  );
}
