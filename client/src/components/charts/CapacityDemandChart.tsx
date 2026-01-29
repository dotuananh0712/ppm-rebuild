import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCapacityDemand } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function CapacityDemandChart() {
  const { data, isLoading, error } = useCapacityDemand(6);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Failed to load capacity data
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No capacity data available
      </div>
    );
  }

  // Format month labels
  const chartData = data.map((d) => ({
    ...d,
    month: new Date(d.monthDate + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(value) => `${value} FTE`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value.toFixed(1)} FTE`]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="capacity"
          name="Capacity"
          stroke="#22c55e"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCapacity)"
        />
        <Area
          type="monotone"
          dataKey="demand"
          name="Demand"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorDemand)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
