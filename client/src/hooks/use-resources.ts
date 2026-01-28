import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Employee, InsertEmployee } from "@shared/schema";

export function useEmployees(filters?: {
  roleId?: number;
  teamId?: number;
  level?: string;
  activeOnly?: boolean;
}) {
  const queryString = new URLSearchParams();
  if (filters?.roleId) queryString.set("roleId", String(filters.roleId));
  if (filters?.teamId) queryString.set("teamId", String(filters.teamId));
  if (filters?.level) queryString.set("level", filters.level);
  if (filters?.activeOnly !== undefined) queryString.set("activeOnly", String(filters.activeOnly));

  const url = `/api/employees${queryString.toString() ? `?${queryString}` : ""}`;

  return useQuery<Employee[]>({
    queryKey: [url],
  });
}

export function useEmployee(id: number) {
  return useQuery<Employee>({
    queryKey: [`/api/employees/${id}`],
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const res = await apiRequest("POST", "/api/employees", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEmployee> }) => {
      const res = await apiRequest("PUT", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
  });
}

export function useRoles() {
  return useQuery<{ id: number; name: string; description: string | null }[]>({
    queryKey: ["/api/roles"],
  });
}

export function useTeams() {
  return useQuery<{ id: number; name: string; orgUnitId: number }[]>({
    queryKey: ["/api/teams"],
  });
}
