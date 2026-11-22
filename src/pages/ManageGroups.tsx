import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/services";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QueryError } from "@/components/groups/QueryError";
import { QuoteRequestDialog } from "@/components/admin/QuoteRequestDialog";
import { formatDate } from "@/utils/format";

export function ManageGroups() {
  const [route, setRoute] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const groups = useQuery({ queryKey: ["groups", {}], queryFn: () => groupService.list() });
  const rows =
    groups.data?.filter(
      (g) =>
        `${g.route} ${g.origin.city} ${g.destination.city}`
          .toLowerCase()
          .includes(route.toLowerCase()) &&
        (status === "all" || g.status === status) &&
        (!date || (g.window_start <= date && g.window_end >= date)),
    ) ?? [];
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-10">
      <h1 className="text-4xl font-semibold">
        Manage <span className="font-serif-accent">groups</span>
      </h1>
      <div className="grid gap-4 border-y py-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="admin-route">Route or city</Label>
          <Input
            id="admin-route"
            placeholder="BLR-DEL"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Group status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "all", label: "All statuses" },
                { value: "forming", label: "Forming" },
                { value: "quotation_eligible", label: "Quote eligible" },
                { value: "quote_requested", label: "Quote requested" },
                { value: "quoted", label: "Quoted" },
                { value: "closed", label: "Closed" },
              ].map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-group-date">Travel date</Label>
          <Input
            id="admin-group-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      {groups.isError ? (
        <QueryError retry={() => groups.refetch()} />
      ) : groups.isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{rows.length} groups</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Date window</TableHead>
                <TableHead>Passenger seats</TableHead>
                <TableHead>Quote threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quote request</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {g.origin.iata_code} → {g.destination.iata_code}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(g.window_start)} – {formatDate(g.window_end)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {g.seats_filled} / {g.max_seats}
                  </TableCell>
                  <TableCell className="tabular-nums">{g.min_seats_for_quote} seats</TableCell>
                  <TableCell>
                    <StatusBadge status={g.status} />
                  </TableCell>
                  <TableCell>
                    {g.status === "quotation_eligible" ? (
                      <QuoteRequestDialog group={g} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {g.status === "quote_requested"
                          ? `Requested · ${g.quote_deadline ? formatDate(g.quote_deadline) : "awaiting response"}`
                          : g.status === "quoted"
                            ? "Quotes published"
                            : g.status === "closed"
                              ? "Closed"
                              : "Threshold not reached"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No groups match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
