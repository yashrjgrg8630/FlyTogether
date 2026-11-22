import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Analytics } from "@/types";
import { formatShortDate } from "@/utils/format";

export function RouteDemandChart({ data }: { data: Analytics["popular_routes"] }) {
  return (
    <ChartContainer
      config={{ count: { label: "Passenger seats", color: "var(--chart-1)" } }}
      className="h-80 w-full min-w-0 aspect-auto"
      aria-label="Route demand in passenger seats"
    >
      <BarChart data={data} layout="vertical" accessibilityLayer margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis dataKey="route" type="category" width={76} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
export function RequestsOverTimeChart({ data }: { data: Analytics["requests_over_time"] }) {
  return (
    <ChartContainer
      config={{ count: { label: "Requests", color: "var(--chart-2)" } }}
      className="h-80 w-full min-w-0 aspect-auto"
      aria-label="Requests over the last fourteen days"
    >
      <LineChart data={data} accessibilityLayer margin={{ left: -20, right: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} minTickGap={30} tickLine={false} />
        <YAxis allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          strokeWidth={3}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
