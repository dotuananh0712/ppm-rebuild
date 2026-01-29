import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery<{
    totalEmployees: number;
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
    totalFte: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });
}

export function useAtRiskProjects() {
  return useQuery<{
    id: number;
    name: string;
    status: string;
    priority: number;
    shortfall: number;
    roles: string[];
  }[]>({
    queryKey: ["/api/dashboard/at-risk-projects"],
  });
}

export function useProjectStatus() {
  return useQuery<{
    status: string;
    count: number;
  }[]>({
    queryKey: ["/api/dashboard/project-status"],
  });
}

export function useFteByDivision() {
  return useQuery<{
    divisionId: number;
    divisionName: string;
    totalFte: number;
    allocatedFte: number;
  }[]>({
    queryKey: ["/api/dashboard/fte-by-division"],
  });
}

export function useUtilizationTrend(months: number = 6) {
  return useQuery<{
    monthDate: string;
    capacity: number;
    demand: number;
    utilization: number;
  }[]>({
    queryKey: ["/api/dashboard/utilization-trend", { months }],
  });
}

export function useCapacityDemand(months: number = 6) {
  return useQuery<{
    monthDate: string;
    capacity: number;
    demand: number;
  }[]>({
    queryKey: [`/api/dashboard/capacity-demand?months=${months}`],
  });
}
