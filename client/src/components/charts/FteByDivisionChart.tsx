import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFteByDivision } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function FteByDivisionChart() {
  const { data, isLoading, error } = useFteByDivision();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Failed to load division data
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No division data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.divisionName.length > 15 ? d.divisionName.slice(0, 15) + "..." : d.divisionName,
    fullName: d.divisionName,
    totalFte: d.totalFte,
    allocatedFte: d.allocatedFte,
    availableFte: Math.max(0, d.totalFte - d.allocatedFte),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)} FTE`,
            name === "allocatedFte" ? "Allocated" : "Available",
          ]}
          labelFormatter={(_, payload: any) => payload?.[0]?.payload?.fullName || ""}
        />
        <Legend
          formatter={(value) => (value === "allocatedFte" ? "Allocated" : "Available")}
        />
        <Bar
          dataKey="allocatedFte"
          stackId="a"
          fill="#3b82f6"
          name="allocatedFte"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="availableFte"
          stackId="a"
          fill="#22c55e"
          name="availableFte"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
