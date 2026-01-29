import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useProjectStatus } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  planned: "#3b82f6",
  active: "#22c55e",
  paused: "#eab308",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

export function ProjectStatusChart() {
  const { data, isLoading, error } = useProjectStatus();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Failed to load project status data
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No project data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: d.count,
    status: d.status,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATUS_COLORS[entry.status] || "#94a3b8"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [
            `${value} project${value !== 1 ? "s" : ""}`,
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-2xl font-bold"
        >
          {total}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-xs"
        >
          Total
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
