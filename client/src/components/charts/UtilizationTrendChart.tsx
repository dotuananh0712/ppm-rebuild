import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useUtilizationTrend } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function UtilizationTrendChart() {
  const { data, isLoading, error } = useUtilizationTrend(6);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Failed to load utilization data
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No utilization data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    month: new Date(d.monthDate + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 120]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value}%`, "Utilization"]}
        />
        <ReferenceLine
          y={100}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{
            value: "100%",
            position: "right",
            fill: "#ef4444",
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={80}
          stroke="#22c55e"
          strokeDasharray="5 5"
          label={{
            value: "Target 80%",
            position: "right",
            fill: "#22c55e",
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="utilization"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#8b5cf6" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
