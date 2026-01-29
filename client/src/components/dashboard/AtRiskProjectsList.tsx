import { useAtRiskProjects } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityLabels: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
  5: "P5",
};

const priorityColors: Record<number, string> = {
  1: "text-red-600 bg-red-50",
  2: "text-orange-600 bg-orange-50",
  3: "text-yellow-600 bg-yellow-50",
  4: "text-blue-600 bg-blue-50",
  5: "text-gray-600 bg-gray-50",
};

export function AtRiskProjectsList() {
  const { data, isLoading, error } = useAtRiskProjects();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Failed to load at-risk projects
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
        <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
        <p>No projects at risk</p>
        <p className="text-sm mt-1">All projects have sufficient resources</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {data.slice(0, 5).map((project) => (
        <div
          key={project.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{project.name}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  priorityColors[project.priority]
                )}
              >
                {priorityLabels[project.priority]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="text-red-600 font-medium">
                -{project.shortfall} FTE shortfall
              </span>
            </div>
            {project.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.roles.slice(0, 3).map((role) => (
                  <span
                    key={role}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs"
                  >
                    {role}
                  </span>
                ))}
                {project.roles.length > 3 && (
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                    +{project.roles.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      {data.length > 5 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          +{data.length - 5} more at-risk projects
        </p>
      )}
    </div>
  );
}
