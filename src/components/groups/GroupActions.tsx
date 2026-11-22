import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { groupService, type ApiError } from "@/services";
import { joinProblem, membershipError } from "@/utils/groupRules";
import type { Group, TravelRequest } from "@/types";

export function GroupActions({
  group,
  requests,
  requestId,
}: {
  group: Group;
  requests: TravelRequest[];
  requestId?: string | undefined;
}) {
  const qc = useQueryClient();
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState(requestId ?? "");
  const [error, setError] = useState("");
  const joined = requests.find((r) => r.status === "grouped" && r.group_id === group.id);
  const candidates = requests.filter(
    (r) =>
      r.status === "open" &&
      r.origin_id === group.origin.id &&
      r.destination_id === group.destination.id,
  );
  const request =
    requests.find((r) => r.id === selected) ??
    candidates.find((r) => !joinProblem(group, r)) ??
    candidates[0];
  const problem = joinProblem(group, request);
  const refresh = () =>
    Promise.all(
      ["groups", "group", "members", "requests", "matches", "quotes"].map((key) =>
        qc.invalidateQueries({ queryKey: [key] }),
      ),
    );
  const mutation = useMutation({
    mutationFn: async () => {
      if (joined) return groupService.leave(group.id);
      if (!request) throw new Error("Choose a requirement first.");
      return groupService.join(group.id, request.id);
    },
    onSuccess: async () => {
      toast.success(joined ? "Left group; your requirement is open again" : "Joined group");
      setDialog(false);
      setError("");
      await refresh();
    },
    onError: async (e) => {
      setError(membershipError(e as ApiError));
      await refresh();
    },
  });
  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {!joined && problem && <p className="text-xs text-muted-foreground">{problem}</p>}
      {!joined &&
      !candidates.length &&
      group.seats_filled < group.max_seats &&
      ["forming", "quotation_eligible"].includes(group.status) ? (
        <Button variant="outline" asChild>
          <Link to="/create-request">New requirement</Link>
        </Button>
      ) : (
        <Button
          variant={joined ? "outline" : "coral"}
          disabled={!joined && !!problem}
          onClick={() => {
            setError("");
            setDialog(true);
          }}
        >
          {joined ? <LogOut /> : <UserPlus />}
          {joined ? "Leave group" : "Join group"}
        </Button>
      )}
      <AlertDialog
        open={dialog}
        onOpenChange={(open) => {
          if (!mutation.isPending) setDialog(open);
        }}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{joined ? "Leave this group?" : "Join this group?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {group.origin.iata_code} → {group.destination.iata_code}.{" "}
              {joined
                ? `Your ${joined.passenger_count} passenger seats will be removed and your requirement will reopen.`
                : `Add ${request?.passenger_count ?? 0} passenger seats to this group. This does not book or reserve airline seats.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!joined && (
            <Select
              value={request?.id ?? ""}
              onValueChange={setSelected}
              disabled={mutation.isPending}
            >
              <SelectTrigger aria-label="Requirement to join with">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.departure_date} · {r.passenger_count} passenger seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {!joined && problem && <p className="text-sm text-destructive">{problem}</p>}
          <AlertDialogFooter>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setDialog(false)}
            >
              Keep browsing
            </Button>
            <Button
              variant={joined ? "destructive" : "coral"}
              disabled={mutation.isPending || (!joined && !!problem)}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Updating…" : joined ? "Confirm leave" : "Confirm join"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
