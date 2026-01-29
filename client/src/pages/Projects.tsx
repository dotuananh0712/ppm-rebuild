import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Calendar, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterBar } from "@/components/filters/FilterBar";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { PriorityFilter } from "@/components/filters/PriorityFilter";
import { useProjectFilterState } from "@/hooks/use-filter-state";

const statusColors: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const priorityLabels: Record<number, string> = {
  1: "P1 - Critical",
  2: "P2 - High",
  3: "P3 - Medium",
  4: "P4 - Low",
  5: "P5 - Minimal",
};

export default function Projects() {
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useProjectFilterState();

  const { data: projects, isLoading } = useProjects({
    status: filters.status,
    priority: filters.priority,
  });

  const activeCount = projects?.filter((p) => p.status === "active").length ?? 0;
  const plannedCount = projects?.filter((p) => p.status === "planned").length ?? 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage project portfolio and priorities
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onClear={clearFilters} hasActiveFilters={hasActiveFilters}>
        <StatusFilter
          value={filters.status}
          onChange={(v) => updateFilter("status", v)}
        />
        <PriorityFilter
          value={filters.priority}
          onChange={(v) => updateFilter("priority", v)}
        />
      </FilterBar>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-2xl font-semibold">{projects?.length ?? 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-semibold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600">Planned</p>
          <p className="text-2xl font-semibold text-blue-700">{plannedCount}</p>
        </div>
      </div>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="divide-y">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-4 hover:bg-muted/30 px-2 rounded"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{priorityLabels[project.priority]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{project.plannedStart} → {project.plannedEnd}</span>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        statusColors[project.status]
                      )}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
              <p className="text-sm mt-2">Create your first project to start planning</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
