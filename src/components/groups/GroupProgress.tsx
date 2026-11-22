import { motion, useReducedMotion } from "framer-motion";
import { seatPct } from "@/utils/format";
/** Capacity is always passenger seats, never members. */
export function GroupProgress({
  filled,
  max,
  threshold,
}: {
  filled: number;
  max: number;
  threshold?: number;
}) {
  const pct = seatPct(filled, max);
  const reduce = useReducedMotion();
  const tick = threshold && threshold < max ? seatPct(threshold, max) : null;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs tabular-nums">
        <span className="font-medium">
          {filled} / {max} seats filled
        </span>
        <span className="text-muted-foreground">{max - filled} left</span>
      </div>
      <div
        className="relative h-1.5 rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={filled}
        aria-label="Passenger seats filled"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          style={reduce ? { width: `${pct}%` } : {}}
        />
        {tick !== null && (
          <span
            className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-foreground"
            style={{ left: `${tick}%` }}
            title={`Quote threshold: ${threshold} seats`}
          />
        )}
      </div>
      {tick !== null && (
        <p className="text-[11px] text-subtle tabular-nums">Quote threshold · {threshold} seats</p>
      )}
    </div>
  );
}
