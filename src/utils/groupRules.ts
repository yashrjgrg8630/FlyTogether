import type { Group, TravelRequest } from "@/types";

export const dateDistance = (a: string, b: string) =>
  Math.abs((Date.parse(a) - Date.parse(b)) / 864e5);
export function joinProblem(group: Group, request?: TravelRequest): string | null {
  if (group.seats_filled >= group.max_seats)
    return "This group is full. Try another matching group.";
  if (!["forming", "quotation_eligible"].includes(group.status))
    return "This group is no longer accepting travellers.";
  if (!request) return "Choose an open requirement for this route.";
  if (request.status === "grouped")
    return "This requirement is already in a group. Leave that group first.";
  if (request.status !== "open")
    return "This requirement was cancelled. Choose an open requirement.";
  if (request.origin_id !== group.origin.id || request.destination_id !== group.destination.id)
    return "This requirement has a different route.";
  if (dateDistance(group.target_date, request.departure_date) > request.flexibility_days + 2)
    return "This group is outside your flexible date window.";
  if (group.max_seats - group.seats_filled < request.passenger_count)
    return `Only ${group.max_seats - group.seats_filled} passenger seats remain; your requirement needs ${request.passenger_count}.`;
  return null;
}
export function membershipError(error: { status?: number; message?: string }): string {
  if (error.status === 409)
    return `${error.message || "Availability or membership changed."} Group availability has been refreshed. Review it before trying again.`;
  return error.message || "Could not update your group. Please try again.";
}
