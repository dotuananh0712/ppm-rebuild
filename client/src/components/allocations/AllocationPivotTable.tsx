import { cn } from "@/lib/utils";
import type { PivotData } from "@/hooks/use-allocations";
import { Skeleton } from "@/components/ui/skeleton";

interface AllocationPivotTableProps {
  data: PivotData | null;
  isLoading: boolean;
}

function getUtilizationColor(fte: number): string {
  if (fte === 0) return "bg-gray-50 text-gray-400";
  if (fte < 0.5) return "bg-green-50 text-green-700";
  if (fte < 1) return "bg-green-100 text-green-800";
  if (fte < 2) return "bg-yellow-50 text-yellow-700";
  if (fte < 3) return "bg-yellow-100 text-yellow-800";
  if (fte < 5) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function formatMonth(monthStr: string): string {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function AllocationPivotTable({ data, isLoading }: AllocationPivotTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!data || data.roles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No allocation data found for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-3 px-4 font-semibold border-b sticky left-0 bg-muted/50 min-w-[180px]">
              Role
            </th>
            {data.months.map((month) => (
              <th
                key={month}
                className="text-center py-3 px-3 font-semibold border-b min-w-[80px]"
              >
                {formatMonth(month)}
              </th>
            ))}
            <th className="text-center py-3 px-4 font-semibold border-b bg-muted/30 min-w-[80px]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {data.roles.map((role) => (
            <tr key={role.roleId} className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-4 font-medium border-b sticky left-0 bg-background">
                {role.roleName}
              </td>
              {data.months.map((month) => {
                const value = role.values[month] || 0;
                return (
                  <td
                    key={month}
                    className={cn(
                      "text-center py-2 px-3 border-b font-medium",
                      getUtilizationColor(value)
                    )}
                  >
                    {value > 0 ? value.toFixed(1) : "-"}
                  </td>
                );
              })}
              <td className="text-center py-2 px-4 border-b bg-muted/20 font-semibold">
                {role.total.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50 font-semibold">
            <td className="py-3 px-4 border-t sticky left-0 bg-muted/50">Total</td>
            {data.months.map((month) => (
              <td key={month} className="text-center py-3 px-3 border-t">
                {(data.totals[month] || 0).toFixed(1)}
              </td>
            ))}
            <td className="text-center py-3 px-4 border-t bg-primary/10 text-primary">
              {data.grandTotal.toFixed(1)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>FTE Levels:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          <span>&lt;0.5</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span>0.5-1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-200" />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
          <span>2-3</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
          <span>3-5</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
          <span>&gt;5</span>
        </div>
      </div>
    </div>
  );
}
