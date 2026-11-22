import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { RequestForm } from "@/components/travel/RequestForm";
import { travelService, type ApiError } from "@/services";

export function CreateRequest() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-4xl font-semibold">
        Publish a flight <span className="font-serif-accent">requirement</span>
      </h1>
      <p className="mt-1 text-muted-foreground">
        We'll suggest groups on the same route and dates. You choose whether to join.
      </p>
      <div className="mt-8 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
        <RequestForm
          submitLabel="Publish requirement"
          onSubmit={async (p) => {
            try {
              const request = await travelService.create(p);
              await qc.invalidateQueries({ queryKey: ["requests"] });
              toast.success("Requirement published");
              navigate({ to: "/requests/$requestId/matches", params: { requestId: request.id } });
            } catch (e) {
              toast.error((e as ApiError).message || "Could not publish requirement");
            }
          }}
        />
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Publishing does not book or reserve any seat.
      </p>
    </div>
  );
}
