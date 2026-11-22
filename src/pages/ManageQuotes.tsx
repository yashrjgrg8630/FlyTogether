import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Send } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { groupService, quoteService } from "@/services";
import { adminQuoteSchema } from "@/utils/adminValidation";
import { quoteValidity } from "@/utils/quoteRules";
import { formatDate, formatINR } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/groups/QueryError";
import { SourceBadge } from "@/components/quotations/SourceBadge";
import type { Quote } from "@/types";

type Values = z.infer<typeof adminQuoteSchema>;
export function ManageQuotes() {
  const client = useQueryClient();
  const groups = useQuery({ queryKey: ["groups", {}], queryFn: () => groupService.list() });
  const quotes = useQuery({ queryKey: ["admin", "quotes"], queryFn: quoteService.listAdmin });
  const [publishQuote, setPublishQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(adminQuoteSchema),
    defaultValues: {
      group_id: "",
      source_type: "simulated",
      airline_name: "",
      baggage_details: "",
      terms: "",
      valid_until: "",
    },
  });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["admin"] });
    client.invalidateQueries({ queryKey: ["quotes"] });
    client.invalidateQueries({ queryKey: ["groups"] });
    client.invalidateQueries({ queryKey: ["group"] });
  };
  const create = useMutation({
    mutationFn: quoteService.create,
    onSuccess: () => {
      refresh();
      reset();
      setError("");
      toast.success("Draft saved · not visible to travellers yet");
    },
    onError: (e) => setError(e.message),
  });
  const publish = useMutation({
    mutationFn: quoteService.publish,
    onSuccess: () => {
      refresh();
      setPublishQuote(null);
      setError("");
      toast.success("Quotation published to travellers");
    },
    onError: (e) => {
      setError(e.message);
      refresh();
      setPublishQuote(null);
    },
  });
  const groupId = watch("group_id");
  const source = watch("source_type");
  const rows = [...(quotes.data ?? [])]
    .filter(
      (q) =>
        filter === "all" ||
        (filter === "expired"
          ? quoteValidity(q, Date.now()).expired
          : q.status === filter && !quoteValidity(q, Date.now()).expired),
    )
    .reverse();
  const fieldError = (name: keyof Values) =>
    errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <h1 className="text-4xl font-semibold">
        Manage <span className="font-serif-accent">quotes</span>
      </h1>
      {groups.isError || quotes.isError ? (
        <QueryError
          message="Couldn't load quotation management."
          retry={() => {
            groups.refetch();
            quotes.refetch();
          }}
        />
      ) : groups.isLoading || quotes.isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <>
          <section className="space-y-5 border-y py-6">
            <div>
              <h2 className="text-xl font-semibold">Add a quotation</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Saved as a draft. Publishing makes it visible to travellers.
              </p>
            </div>
            <form
              className="space-y-5"
              noValidate
              onSubmit={handleSubmit((values) => {
                setError("");
                create.mutate(values);
              })}
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select
                    value={groupId}
                    onValueChange={(v) => {
                      if (v) setValue("group_id", v, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger aria-label="Quote group">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.data
                        ?.filter((g) => g.status !== "closed")
                        .map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.origin.iata_code} → {g.destination.iata_code} ·{" "}
                            {formatDate(g.target_date)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {fieldError("group_id")}
                </div>
                <div className="space-y-2">
                  <Label>Quote source</Label>
                  <Select
                    value={source}
                    onValueChange={(v) => {
                      if (v === "simulated" || v === "manual") setValue("source_type", v);
                    }}
                  >
                    <SelectTrigger aria-label="Quote source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulated">Simulated · demo data</SelectItem>
                      <SelectItem value="manual">Manual · entered by admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-airline">Airline</Label>
                  <Input
                    id="quote-airline"
                    {...register("airline_name")}
                    aria-invalid={!!errors.airline_name}
                  />
                  {fieldError("airline_name")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-price">Price per passenger (₹)</Label>
                  <Input
                    id="quote-price"
                    type="number"
                    min="0.01"
                    step="any"
                    {...register("price_per_passenger")}
                    aria-invalid={!!errors.price_per_passenger}
                  />
                  {fieldError("price_per_passenger")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-seats">Available passenger seats</Label>
                  <Input
                    id="quote-seats"
                    type="number"
                    min="1"
                    step="1"
                    {...register("available_seats")}
                    aria-invalid={!!errors.available_seats}
                  />
                  {fieldError("available_seats")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-validity">Valid until</Label>
                  <Input
                    id="quote-validity"
                    type="date"
                    {...register("valid_until")}
                    aria-invalid={!!errors.valid_until}
                  />
                  {fieldError("valid_until")}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quote-baggage">Baggage details</Label>
                  <Textarea
                    id="quote-baggage"
                    placeholder="Check-in and cabin allowance"
                    {...register("baggage_details")}
                    aria-invalid={!!errors.baggage_details}
                  />
                  {fieldError("baggage_details")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-terms">Terms</Label>
                  <Textarea id="quote-terms" {...register("terms")} aria-invalid={!!errors.terms} />
                  {fieldError("terms")}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SourceBadge source={source} />
                <Button type="submit" disabled={create.isPending}>
                  <FilePlus2 />
                  {create.isPending ? "Saving…" : "Save draft"}
                </Button>
              </div>
            </form>
          </section>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Quotation records</h2>
              <div className="w-44">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger aria-label="Quotation status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "draft", "published", "expired"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value === "all"
                          ? "All quotations"
                          : value.charAt(0).toUpperCase() + value.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="divide-y">
              {rows.map((q) => {
                const group = groups.data?.find((g) => g.id === q.group_id);
                const expired = quoteValidity(q, Date.now()).expired;
                return (
                  <article
                    key={q.id}
                    aria-label={`${q.airline_name} admin quote`}
                    className="flex flex-wrap items-start justify-between gap-4 py-5"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold">{q.airline_name}</h3>
                        <SourceBadge source={q.source_type} />
                        <span
                          className={
                            expired
                              ? "text-xs font-semibold text-destructive"
                              : "text-xs font-semibold text-info"
                          }
                        >
                          {expired ? "Expired" : q.status === "draft" ? "Draft" : "Published"}
                        </span>
                      </div>
                      <p className="text-sm">
                        {group?.route ?? q.group_id} · {formatINR(q.price_per_passenger)} /
                        passenger · {q.available_seats} passenger seats
                      </p>
                      <p className="break-words text-xs text-muted-foreground">
                        {q.baggage_details}
                      </p>
                      <p className="break-words text-xs text-muted-foreground">{q.terms}</p>
                      <p className="text-xs text-muted-foreground">
                        Valid until {formatDate(q.valid_until)}
                      </p>
                    </div>
                    {q.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={expired || publish.isPending || group?.status === "closed"}
                        onClick={() => setPublishQuote(q)}
                      >
                        <Send />
                        Publish
                      </Button>
                    )}
                  </article>
                );
              })}
              {!rows.length && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No quotations in this view.
                </p>
              )}
            </div>
          </section>
          <p className="border-t pt-5 text-xs text-muted-foreground">
            FlyTogether aggregates demand. It does not sell tickets or reserve seats.
          </p>
        </>
      )}
      <AlertDialog
        open={!!publishQuote}
        onOpenChange={(open) => {
          if (!open) setPublishQuote(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              {publishQuote?.airline_name} · {formatINR(publishQuote?.price_per_passenger ?? 0)} per
              passenger. Travellers will see this quote with its source label and terms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (publishQuote) publish.mutate(publishQuote.id);
              }}
            >
              Publish quotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
