import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Info } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import { ProjectFilter } from "@/components/filters/ProjectFilter";
import { RoleFilter } from "@/components/filters/RoleFilter";
import { MonthRangeFilter } from "@/components/filters/MonthRangeFilter";
import { AllocationPivotTable } from "@/components/allocations/AllocationPivotTable";
import { useAllocationFilterState } from "@/hooks/use-filter-state";
import { useAllocationPivot } from "@/hooks/use-allocations";

export default function Allocations() {
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useAllocationFilterState();

  const { data, isLoading } = useAllocationPivot({
    projectId: filters.projectId,
    roleId: filters.roleId,
    startMonth: filters.startMonth,
    endMonth: filters.endMonth,
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Allocations</h1>
        <p className="text-muted-foreground mt-2">
          Manage monthly role allocations for projects
        </p>
      </div>

      {/* Filters */}
      <FilterBar onClear={clearFilters} hasActiveFilters={hasActiveFilters}>
        <ProjectFilter
          value={filters.projectId}
          onChange={(v) => updateFilter("projectId", v)}
        />
        <RoleFilter
          value={filters.roleId}
          onChange={(v) => updateFilter("roleId", v)}
        />
        <MonthRangeFilter
          startMonth={filters.startMonth}
          endMonth={filters.endMonth}
          onStartChange={(v) => updateFilter("startMonth", v)}
          onEndChange={(v) => updateFilter("endMonth", v)}
        />
      </FilterBar>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Role-Based Allocation</p>
          <p className="text-sm text-blue-600 mt-1">
            Allocations are defined by role and month, not by individual person.
            This supports ramp-up, ramp-down, and flexible resource planning.
          </p>
        </div>
      </div>

      {/* Allocation Pivot Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">FTE Allocation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.roles.length === 0 && !isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarRange className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No allocations found</p>
              <p className="text-sm mt-2">
                Create projects and add role allocations to start capacity planning
              </p>
            </div>
          ) : (
            <AllocationPivotTable data={data} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
