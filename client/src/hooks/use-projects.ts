import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, InsertProject } from "@shared/schema";

export function useProjects(filters?: {
  status?: string;
  priority?: number;
  portfolioGroup?: string;
}) {
  const queryString = new URLSearchParams();
  if (filters?.status) queryString.set("status", filters.status);
  if (filters?.priority) queryString.set("priority", String(filters.priority));
  if (filters?.portfolioGroup) queryString.set("portfolioGroup", filters.portfolioGroup);

  const url = `/api/projects${queryString.toString() ? `?${queryString}` : ""}`;

  return useQuery<Project[]>({
    queryKey: [url],
  });
}

export function useProject(id: number) {
  return useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProject> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}
