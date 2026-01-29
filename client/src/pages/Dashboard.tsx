import { useDashboard } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FolderKanban, Building2, TrendingUp } from "lucide-react";
import { CapacityDemandChart } from "@/components/charts/CapacityDemandChart";
import { ProjectStatusChart } from "@/components/charts/ProjectStatusChart";
import { FteByDivisionChart } from "@/components/charts/FteByDivisionChart";
import { UtilizationTrendChart } from "@/components/charts/UtilizationTrendChart";
import { AtRiskProjectsList } from "@/components/dashboard/AtRiskProjectsList";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Failed to load dashboard data. Please check your database connection.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your project portfolio and resource capacity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees}
          icon={Users}
          isLoading={isLoading}
          color="text-blue-500"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects}
          subtitle={`of ${stats?.totalProjects ?? 0} total`}
          icon={FolderKanban}
          isLoading={isLoading}
          color="text-green-500"
        />
        <StatCard
          title="Teams"
          value={stats?.totalTeams}
          icon={Building2}
          isLoading={isLoading}
          color="text-purple-500"
        />
        <StatCard
          title="Total FTE Capacity"
          value={stats?.totalFte?.toFixed(1)}
          icon={TrendingUp}
          isLoading={isLoading}
          color="text-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacity vs Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityDemandChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">At-Risk Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <AtRiskProjectsList />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">FTE by Division</CardTitle>
          </CardHeader>
          <CardContent>
            <FteByDivisionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilization Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <UtilizationTrendChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  color,
}: {
  title: string;
  value?: number | string;
  subtitle?: string;
  icon: React.ElementType;
  isLoading: boolean;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <>
                <p className="text-3xl font-bold mt-2">{value ?? 0}</p>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </>
            )}
          </div>
          <div className={`${color} bg-current/10 p-3 rounded-full`}>
            <Icon className="w-6 h-6" style={{ color: "currentColor" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
