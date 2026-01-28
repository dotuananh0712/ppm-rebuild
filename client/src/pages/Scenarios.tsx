import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Check, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@shared/schema";

export default function Scenarios() {
  const { data: scenarios, isLoading } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  const baseline = scenarios?.find((s) => s.type === "BASELINE");
  const whatIfs = scenarios?.filter((s) => s.type === "WHAT_IF") ?? [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenarios</h1>
          <p className="text-muted-foreground mt-2">
            Create and compare what-if scenarios for portfolio planning
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Scenario
        </Button>
      </div>

      {/* Baseline Scenario */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Baseline</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current approved portfolio plan
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              BASELINE
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : baseline ? (
            <div className="text-sm text-muted-foreground">
              {baseline.description || "No description provided"}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No baseline scenario configured. Create one to compare what-if scenarios.
            </div>
          )}
        </CardContent>
      </Card>

      {/* What-If Scenarios */}
      <div>
        <h2 className="text-lg font-semibold mb-4">What-If Scenarios</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : whatIfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatIfs.map((scenario) => (
              <Card key={scenario.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{scenario.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {scenario.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        scenario.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {scenario.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No what-if scenarios</p>
                <p className="text-sm mt-2">
                  Create scenarios to explore different portfolio options
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
