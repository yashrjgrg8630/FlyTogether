import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quoteService } from "@/services";
import { quoteRequestSchema } from "@/utils/adminValidation";
import type { Group } from "@/types";

export function QuoteRequestDialog({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: quoteService.requestQuotes,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["groups"] });
      client.invalidateQueries({ queryKey: ["group", group.id] });
      client.invalidateQueries({ queryKey: ["admin"] });
      setOpen(false);
      toast.success("Quote request created");
    },
    onError: (e) => {
      setError(e.message);
      client.invalidateQueries({ queryKey: ["groups"] });
    },
  });
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={group.status !== "quotation_eligible"}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        <Send />
        Request quotes
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request quotes · {group.origin.iata_code} → {group.destination.iata_code}
            </DialogTitle>
            <DialogDescription>
              {group.seats_filled} passenger seats · threshold {group.min_seats_for_quote}. Create a
              quote request; no airline email is sent.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = quoteRequestSchema.safeParse({ group_id: group.id, deadline });
              if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? "Select a deadline");
                return;
              }
              setError("");
              mutation.mutate(parsed.data);
            }}
          >
            <Label htmlFor={`deadline-${group.id}`}>Quote deadline</Label>
            <Input
              id={`deadline-${group.id}`}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={mutation.isPending}>
              <Send />
              {mutation.isPending ? "Creating…" : "Create quote request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
