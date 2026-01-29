import { useQuery } from "@tanstack/react-query";
import type { ProjectRoleAllocation, Role, Project } from "@shared/schema";

interface AllocationFilters {
  projectId?: number;
  roleId?: number;
  startMonth?: string;
  endMonth?: string;
}

export function useAllocations(filters?: AllocationFilters) {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", String(filters.projectId));
  if (filters?.roleId) params.set("roleId", String(filters.roleId));
  if (filters?.startMonth) params.set("startMonth", filters.startMonth);
  if (filters?.endMonth) params.set("endMonth", filters.endMonth);

  const url = `/api/allocations${params.toString() ? `?${params}` : ""}`;

  return useQuery<ProjectRoleAllocation[]>({
    queryKey: [url],
  });
}

export interface PivotData {
  months: string[];
  roles: {
    roleId: number;
    roleName: string;
    values: Record<string, number>; // month -> FTE
    total: number;
  }[];
  totals: Record<string, number>; // month -> total FTE
  grandTotal: number;
}

export function useAllocationPivot(filters?: AllocationFilters) {
  const { data: allocations, isLoading: loadingAllocs, error: allocError } = useAllocations(filters);
  const { data: roles, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });
  const { data: projects, isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const isLoading = loadingAllocs || loadingRoles || loadingProjects;
  const error = allocError;

  let pivotData: PivotData | null = null;

  if (allocations && roles) {
    // Determine month range
    const months = new Set<string>();
    for (const alloc of allocations) {
      months.add(alloc.monthDate.slice(0, 7)); // YYYY-MM
    }
    const sortedMonths = Array.from(months).sort();

    // If no filter range provided, use data range
    let displayMonths = sortedMonths;
    if (filters?.startMonth || filters?.endMonth) {
      displayMonths = sortedMonths.filter((m) => {
        if (filters.startMonth && m < filters.startMonth) return false;
        if (filters.endMonth && m > filters.endMonth) return false;
        return true;
      });
    }

    // Create role map
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    // Build pivot
    const roleData: Record<number, { values: Record<string, number>; total: number }> = {};
    const totals: Record<string, number> = {};

    for (const alloc of allocations) {
      const month = alloc.monthDate.slice(0, 7);
      if (!displayMonths.includes(month)) continue;

      if (!roleData[alloc.roleId]) {
        roleData[alloc.roleId] = { values: {}, total: 0 };
      }

      const fte = Number(alloc.requiredFte);
      roleData[alloc.roleId].values[month] = (roleData[alloc.roleId].values[month] || 0) + fte;
      roleData[alloc.roleId].total += fte;
      totals[month] = (totals[month] || 0) + fte;
    }

    // Convert to array
    const roleRows = Object.entries(roleData).map(([roleId, data]) => ({
      roleId: Number(roleId),
      roleName: roleMap.get(Number(roleId)) || "Unknown",
      values: data.values,
      total: Math.round(data.total * 100) / 100,
    }));

    // Sort by total descending
    roleRows.sort((a, b) => b.total - a.total);

    const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

    pivotData = {
      months: displayMonths,
      roles: roleRows,
      totals: Object.fromEntries(
        Object.entries(totals).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }

  return {
    data: pivotData,
    isLoading,
    error,
    projects,
    roles,
  };
}
