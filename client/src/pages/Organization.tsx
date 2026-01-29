import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, List, Network } from "lucide-react";
import { OrgKnowledgeGraph } from "@/components/org/OrgKnowledgeGraph";
import { cn } from "@/lib/utils";
import type { OrgUnit } from "@shared/schema";

type ViewMode = "tree" | "graph";

export default function Organization() {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  const { data: orgUnits, isLoading } = useQuery<OrgUnit[]>({
    queryKey: ["/api/org-units"],
  });

  const divisions = orgUnits?.filter((u) => u.type === "division") ?? [];
  const functions = orgUnits?.filter((u) => u.type === "function") ?? [];
  const subfunctions = orgUnits?.filter((u) => u.type === "subfunction") ?? [];
  const teams = orgUnits?.filter((u) => u.type === "team") ?? [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-muted-foreground mt-2">
            Manage organizational hierarchy and structure
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "tree" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("tree")}
            className={cn(
              "gap-2",
              viewMode === "tree" ? "" : "hover:bg-muted-foreground/10"
            )}
          >
            <List className="w-4 h-4" />
            Tree View
          </Button>
          <Button
            variant={viewMode === "graph" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("graph")}
            className={cn(
              "gap-2",
              viewMode === "graph" ? "" : "hover:bg-muted-foreground/10"
            )}
          >
            <Network className="w-4 h-4" />
            Graph View
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBadge label="Divisions" count={divisions.length} isLoading={isLoading} />
        <StatBadge label="Functions" count={functions.length} isLoading={isLoading} />
        <StatBadge label="Subfunctions" count={subfunctions.length} isLoading={isLoading} />
        <StatBadge label="Teams" count={teams.length} isLoading={isLoading} />
      </div>

      {/* View Content */}
      {viewMode === "tree" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : orgUnits && orgUnits.length > 0 ? (
              <OrgTree units={orgUnits} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No organizational units found</p>
                <p className="text-sm mt-2">Create your first org unit to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <OrgKnowledgeGraph />
      )}
    </div>
  );
}

function StatBadge({
  label,
  count,
  isLoading,
}: {
  label: string;
  count: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-12 mt-1" />
      ) : (
        <p className="text-2xl font-semibold">{count}</p>
      )}
    </div>
  );
}

function OrgTree({ units }: { units: OrgUnit[] }) {
  const rootUnits = units.filter((u) => !u.parentId);

  const getChildren = (parentId: number) =>
    units.filter((u) => u.parentId === parentId);

  const renderNode = (unit: OrgUnit, depth: number = 0) => {
    const children = getChildren(unit.id);
    return (
      <div key={unit.id} style={{ marginLeft: depth * 24 }}>
        <div className="flex items-center gap-2 py-2 px-3 rounded hover:bg-muted/50 cursor-pointer">
          {children.length > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <span className="capitalize text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {unit.type}
          </span>
          <span className="font-medium">{unit.name}</span>
        </div>
        {children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return <div className="space-y-1">{rootUnits.map((unit) => renderNode(unit))}</div>;
}
