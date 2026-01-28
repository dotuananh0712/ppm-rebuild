import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapacityVsDemand } from "@shared/schema";

export default function Capacity() {
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1)
    .toISOString()
    .slice(0, 10);

  const { data: capacityData, isLoading } = useQuery<CapacityVsDemand[]>({
    queryKey: [`/api/capacity-vs-demand?startMonth=${startMonth}&endMonth=${endMonth}`],
  });

  // Group by role
  const byRole = capacityData?.reduce((acc, item) => {
    if (!acc[item.roleId]) {
      acc[item.roleId] = {
        roleName: item.roleName,
        items: [],
      };
    }
    acc[item.roleId].items.push(item);
    return acc;
  }, {} as Record<number, { roleName: string; items: CapacityVsDemand[] }>);

  // Summary stats
  const overallocatedRoles =
    capacityData?.filter((c) => c.gap < 0).length ?? 0;
  const totalGap = capacityData?.reduce((sum, c) => sum + c.gap, 0) ?? 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capacity Planning</h1>
        <p className="text-muted-foreground mt-2">
          Analyze capacity vs demand across roles and time periods
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Net Capacity Gap</p>
          </div>
          <p
            className={cn(
              "text-2xl font-semibold mt-2",
              totalGap >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {totalGap >= 0 ? "+" : ""}
            {totalGap.toFixed(1)} FTE
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg p-4",
            overallocatedRoles > 0 ? "bg-red-50" : "bg-green-50"
          )}
        >
          <div className="flex items-center gap-2">
            {overallocatedRoles > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <p
              className={cn(
                "text-sm",
                overallocatedRoles > 0 ? "text-red-600" : "text-green-600"
              )}
            >
              Overallocated Roles
            </p>
          </div>
          <p
            className={cn(
              "text-2xl font-semibold mt-2",
              overallocatedRoles > 0 ? "text-red-700" : "text-green-700"
            )}
          >
            {overallocatedRoles}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Roles Analyzed</p>
          <p className="text-2xl font-semibold mt-2">
            {Object.keys(byRole ?? {}).length}
          </p>
        </div>
      </div>

      {/* Capacity by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Capacity vs Demand by Role</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : byRole && Object.keys(byRole).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(byRole).map(([roleId, { roleName, items }]) => {
                const totalCapacity = items.reduce(
                  (sum, i) => sum + i.availableFte,
                  0
                );
                const totalDemand = items.reduce(
                  (sum, i) => sum + i.requiredFte,
                  0
                );
                const utilization =
                  totalCapacity > 0
                    ? Math.min((totalDemand / totalCapacity) * 100, 100)
                    : 0;
                const isOverallocated = totalDemand > totalCapacity;

                return (
                  <div key={roleId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{roleName}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Capacity: {totalCapacity.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          Demand: {totalDemand.toFixed(1)}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isOverallocated ? "text-red-600" : "text-green-600"
                          )}
                        >
                          {isOverallocated ? "Over" : "Under"} by{" "}
                          {Math.abs(totalCapacity - totalDemand).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={utilization}
                      className={cn(
                        "h-3",
                        isOverallocated && "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No capacity data available</p>
              <p className="text-sm mt-2">
                Add employees and project allocations to see capacity analysis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
