import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
export function QueryError({
  retry,
  message = "Couldn't load groups. Please try again.",
}: {
  retry: () => void;
  message?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 p-4"
    >
      <p className="text-sm">{message}</p>
      <Button variant="outline" onClick={retry}>
        <RefreshCw /> Retry
      </Button>
    </div>
  );
}
