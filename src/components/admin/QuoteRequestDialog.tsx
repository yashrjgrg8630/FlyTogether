import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Send, Mail, Plane } from "lucide-react";
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
import { quoteService, adminService } from "@/services";
import { quoteRequestSchema } from "@/utils/adminValidation";
import type { Group } from "@/types";

export function QuoteRequestDialog({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const client = useQueryClient();

  const rfqQuery = useQuery({
    queryKey: ["admin", "rfq", group.id],
    queryFn: () => adminService.getGroupRFQ(group.id),
    enabled: open && (group.status === "quotation_eligible" || group.status === "quote_requested"),
  });

  const mutation = useMutation({
    mutationFn: quoteService.requestQuotes,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["groups"] });
      client.invalidateQueries({ queryKey: ["group", group.id] });
      client.invalidateQueries({ queryKey: ["admin"] });
      setOpen(false);
      toast.success("Quote request created · status updated to quote_requested");
    },
    onError: (e) => {
      setError(e.message);
      client.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const handleCopyRFQ = () => {
    if (!rfqQuery.data) return;
    navigator.clipboard.writeText(rfqQuery.data.email_body);
    setCopied(true);
    toast.success("Airline RFQ email copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Request quotes · {group.origin.iata_code} → {group.destination.iata_code}
            </DialogTitle>
            <DialogDescription>
              {group.seats_filled} passenger seats · threshold {group.min_seats_for_quote}. Set a
              response deadline and review the airline outreach RFQ.
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
            <div className="space-y-1.5">
              <Label htmlFor={`deadline-${group.id}`}>Quote deadline</Label>
              <Input
                id={`deadline-${group.id}`}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              <Send />
              {mutation.isPending ? "Creating…" : "Update status to Quote Requested"}
            </Button>
          </form>

          {rfqQuery.data && (
            <div className="mt-4 space-y-3 rounded-2xl border bg-secondary/50 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Mail className="size-4 text-primary" /> Airline RFQ Outreach Packet
                </span>
                <Button size="sm" variant="outline" onClick={handleCopyRFQ} className="h-8 gap-1.5 text-xs">
                  {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy RFQ text"}
                </Button>
              </div>
              <div>
                <p className="font-medium text-foreground">Target Airline Group Desks:</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {rfqQuery.data.airline_desks.map((d) => (
                    <span
                      key={d.airline}
                      className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      <Plane className="size-3 text-primary" />
                      {d.airline}: {d.email}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Subject:</p>
                <p className="rounded-md border bg-background p-2 font-mono text-[11px] select-all">
                  {rfqQuery.data.subject}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
