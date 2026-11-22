import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ArrowLeftRight, CalendarIcon, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Airport, TravelRequestPayload } from "@/types";
import { MAX_PASSENGERS, travelRequestSchema, type TravelRequestValues } from "@/utils/validation";
import { AirportCombobox } from "./AirportCombobox";

interface Props {
  initial?: { values: TravelRequestValues; origin: Airport | null; destination: Airport | null };
  submitLabel: string;
  onSubmit: (p: TravelRequestPayload) => Promise<void>;
  onCancel?: () => void;
}

const Err = ({ msg }: { msg?: string | undefined }) =>
  msg ? <p className="text-xs font-medium text-destructive">{msg}</p> : null;

export function RequestForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [origin, setOrigin] = useState<Airport | null>(initial?.origin ?? null);
  const [destination, setDestination] = useState<Airport | null>(initial?.destination ?? null);
  const [dateOpen, setDateOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<TravelRequestValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: initial?.values ?? {
      origin_id: "",
      destination_id: "",
      departure_date: "",
      flexibility_days: 2,
      passenger_count: 1,
      max_budget: null,
    },
  });

  const pick = (field: "origin_id" | "destination_id", a: Airport | null) => {
    (field === "origin_id" ? setOrigin : setDestination)(a);
    setValue(field, a?.id ?? "", { shouldValidate: isSubmitted });
    if (isSubmitted) void trigger("destination_id");
  };
  const swap = () => {
    const o = origin,
      d = destination;
    pick("origin_id", d);
    pick("destination_id", o);
  };

  const submit = handleSubmit(async (v) => {
    await onSubmit({ ...v, max_budget: v.max_budget ?? null });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="origin">From</Label>
          <AirportCombobox
            id="origin"
            value={origin}
            onChange={(a) => pick("origin_id", a)}
            placeholder="Origin airport"
            excludeId={destination?.id}
            invalid={!!errors.origin_id}
          />
          <Err msg={errors.origin_id?.message} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="mx-auto rounded-full sm:mt-8"
        >
          <ArrowLeftRight className="rotate-90 sm:rotate-0" />
        </Button>
        <div className="space-y-1.5">
          <Label htmlFor="destination">To</Label>
          <AirportCombobox
            id="destination"
            value={destination}
            onChange={(a) => pick("destination_id", a)}
            placeholder="Destination airport"
            excludeId={origin?.id}
            invalid={!!errors.destination_id}
          />
          <Err msg={errors.destination_id?.message} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="departure">Departure date</Label>
          <Controller
            control={control}
            name="departure_date"
            render={({ field }) => (
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="departure"
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start rounded-xl font-normal",
                      !field.value && "text-muted-foreground",
                      errors.departure_date && "border-destructive",
                    )}
                  >
                    <CalendarIcon />
                    {field.value ? format(parseISO(field.value), "EEE, d MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto bg-popover p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(d) => {
                      field.onChange(d ? format(d, "yyyy-MM-dd") : "");
                      setDateOpen(false);
                    }}
                    disabled={{ before: new Date() }}
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <Err msg={errors.departure_date?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Passengers</Label>
          <Controller
            control={control}
            name="passenger_count"
            render={({ field }) => (
              <div className="flex h-12 items-center justify-between rounded-xl border bg-background px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fewer passengers"
                  disabled={field.value <= 1}
                  onClick={() => field.onChange(field.value - 1)}
                >
                  <Minus />
                </Button>
                <span className="font-display text-lg font-semibold" aria-live="polite">
                  {field.value}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {field.value === 1 ? "seat" : "seats"}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="More passengers"
                  disabled={field.value >= MAX_PASSENGERS}
                  onClick={() => field.onChange(field.value + 1)}
                >
                  <Plus />
                </Button>
              </div>
            )}
          />
          <Err msg={errors.passenger_count?.message} />
        </div>
      </div>

      <Controller
        control={control}
        name="flexibility_days"
        render={({ field }) => (
          <div className="space-y-3 rounded-2xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between">
              <Label>Date flexibility</Label>
              <span className="rounded-full bg-card px-3 py-1 text-sm font-semibold">
                {field.value === 0
                  ? "Exact date"
                  : `± ${field.value} day${field.value > 1 ? "s" : ""}`}
              </span>
            </div>
            <Slider
              min={0}
              max={7}
              step={1}
              value={[field.value]}
              onValueChange={([v]) => field.onChange(v ?? 0)}
              aria-label="Date flexibility in days"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>More flexibility = more matches</span>
              <span>7</span>
            </div>
            <Err msg={errors.flexibility_days?.message} />
          </div>
        )}
      />

      <div className="space-y-1.5">
        <Label htmlFor="budget">
          Max budget per passenger{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="budget"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 6000"
            className="h-12 rounded-xl pl-7"
            {...register("max_budget", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
            })}
          />
        </div>
        <Err msg={errors.max_budget?.message} />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="hero" size="xl" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
