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
