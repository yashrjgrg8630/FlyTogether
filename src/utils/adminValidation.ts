import { z } from "zod";

const futureDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date")
  .refine((value) => {
    const date = new Date(`${value}T23:59:59.999`);
    return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
  }, "Choose today or a future date");
export const quoteRequestSchema = z.object({ group_id: z.string().min(1), deadline: futureDate });
export const adminQuoteSchema = z.object({
  group_id: z.string().min(1, "Select a group"),
  airline_name: z.string().trim().min(1, "Enter an airline"),
  price_per_passenger: z.coerce.number().finite().positive("Enter a positive price"),
  available_seats: z.coerce
    .number()
    .int("Use whole passenger seats")
    .min(1, "At least one passenger seat is required"),
  valid_until: futureDate,
  source_type: z.enum(["simulated", "manual"]),
  baggage_details: z.string().trim().min(1, "Enter baggage details"),
  terms: z.string().trim().min(1, "Enter the quote terms"),
});
