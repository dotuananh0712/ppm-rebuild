import { useState, useCallback, useMemo } from "react";
import { useLocation, useSearch } from "wouter";

export interface AllocationFilters {
  projectId?: number;
  divisionId?: number;
  subfunctionId?: number;
  roleId?: number;
  startMonth?: string;
  endMonth?: string;
}

export interface ProjectFilters {
  status?: string;
  priority?: number;
  divisionId?: number;
}

export function useAllocationFilterState() {
  const [filters, setFilters] = useState<AllocationFilters>({});

  const updateFilter = useCallback(<K extends keyof AllocationFilters>(
    key: K,
    value: AllocationFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== undefined);
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}

export function useProjectFilterState() {
  const [filters, setFilters] = useState<ProjectFilters>({});

  const updateFilter = useCallback(<K extends keyof ProjectFilters>(
    key: K,
    value: ProjectFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== undefined);
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
