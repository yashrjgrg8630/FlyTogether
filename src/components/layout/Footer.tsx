import { Info } from "lucide-react";
import { Logo } from "@/components/common/Logo";
export const DISCLAIMER =
  "FlyTogether aggregates demand. It does not sell tickets or reserve seats.";
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Pool flight demand with travellers on your route. Compare group quotations together.
          </p>
        </div>
        <p className="flex max-w-md items-start gap-2 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {DISCLAIMER}
        </p>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FlyTogether
      </div>
    </footer>
  );
}
