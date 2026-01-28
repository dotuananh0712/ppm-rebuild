import { useEmployees, useRoles, useTeams } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, Plus, Mail } from "lucide-react";

export default function Resources() {
  const { data: employees, isLoading } = useEmployees();
  const { data: roles } = useRoles();
  const { data: teams } = useTeams();

  const getRoleName = (roleId: number) =>
    roles?.find((r) => r.id === roleId)?.name ?? "Unknown";
  const getTeamName = (teamId: number) =>
    teams?.find((t) => t.id === teamId)?.name ?? "Unknown";

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Manage employees, roles, and team assignments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-2xl font-semibold">{employees?.length ?? 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Roles Defined</p>
          <p className="text-2xl font-semibold">{roles?.length ?? 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Teams</p>
          <p className="text-2xl font-semibold">{teams?.length ?? 0}</p>
        </div>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : employees && employees.length > 0 ? (
            <div className="divide-y">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between py-4 hover:bg-muted/30 px-2 rounded"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{getRoleName(employee.roleId)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {employee.level?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{getTeamName(employee.teamId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.fteCapacity} FTE
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employees found</p>
              <p className="text-sm mt-2">Add employees to start planning capacity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
