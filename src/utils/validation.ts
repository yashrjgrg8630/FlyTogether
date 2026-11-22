import { z } from "zod";

export const MAX_PASSENGERS = 20;
const todayISO = () => new Date().toLocaleDateString("en-CA");

/** Shared travel-request rules (create + edit). */
export const travelRequestSchema = z
  .object({
    origin_id: z.string().min(1, "Choose an origin airport"),
    destination_id: z.string().min(1, "Choose a destination airport"),
    departure_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a departure date")
      .refine((d) => d >= todayISO(), "Departure date can't be in the past"),
    flexibility_days: z.number().int().min(0, "Minimum 0 days").max(7, "Maximum 7 days"),
    passenger_count: z
      .number()
      .int()
      .min(1, "At least 1 passenger")
      .max(MAX_PASSENGERS, `At most ${MAX_PASSENGERS} passengers`),
    max_budget: z
      .number()
      .positive("Budget must be greater than 0")
      .max(1_000_000)
      .nullable()
      .optional(),
  })
  .refine((v) => !v.origin_id || v.origin_id !== v.destination_id, {
    path: ["destination_id"],
    message: "Destination must be different from origin",
  });

export type TravelRequestValues = z.infer<typeof travelRequestSchema>;
