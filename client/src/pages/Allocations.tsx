import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarRange, Info } from "lucide-react";
import type { ProjectRoleAllocation, Project, Role } from "@shared/schema";

export default function Allocations() {
  const { data: allocations, isLoading } = useQuery<ProjectRoleAllocation[]>({
    queryKey: ["/api/allocations"],
  });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: roles } = useQuery<Role[]>({ queryKey: ["/api/roles"] });

  const getProjectName = (id: number) =>
    projects?.find((p) => p.id === id)?.name ?? "Unknown";
  const getRoleName = (id: number) =>
    roles?.find((r) => r.id === id)?.name ?? "Unknown";

  // Group allocations by project
  const groupedByProject = allocations?.reduce((acc, alloc) => {
    const key = alloc.projectId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(alloc);
    return acc;
  }, {} as Record<number, ProjectRoleAllocation[]>);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Allocations</h1>
        <p className="text-muted-foreground mt-2">
          Manage monthly role allocations for projects
        </p>
      </div>

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

      {/* Allocations by Project */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : groupedByProject && Object.keys(groupedByProject).length > 0 ? (
        Object.entries(groupedByProject).map(([projectId, allocs]) => (
          <Card key={projectId}>
            <CardHeader>
              <CardTitle className="text-lg">
                {getProjectName(Number(projectId))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Role</th>
                      <th className="text-left py-2 px-3 font-medium">Month</th>
                      <th className="text-right py-2 px-3 font-medium">Required FTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocs
                      .sort((a, b) => a.monthDate.localeCompare(b.monthDate))
                      .map((alloc) => (
                        <tr key={alloc.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3">{getRoleName(alloc.roleId)}</td>
                          <td className="py-2 px-3 text-muted-foreground">
                            {alloc.monthDate}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {alloc.requiredFte}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CalendarRange className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No allocations found</p>
              <p className="text-sm mt-2">
                Create projects and add role allocations to start capacity planning
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
