import { X, Building2, Users, UserCircle, FolderKanban, Briefcase, Network, Mail, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrgNodeData, OrgNodeType } from "@/hooks/use-org-graph";
import { cn } from "@/lib/utils";

interface NodeDetailPanelProps {
  node: OrgNodeData | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<OrgNodeType, typeof Building2> = {
  division: Building2,
  function: Network,
  subfunction: Briefcase,
  team: Users,
  employee: UserCircle,
  project: FolderKanban,
};

const TYPE_COLORS: Record<OrgNodeType, string> = {
  division: "text-blue-600",
  function: "text-green-600",
  subfunction: "text-yellow-600",
  team: "text-purple-600",
  employee: "text-teal-600",
  project: "text-orange-600",
};

const STATUS_COLORS: Record<string, string> = {
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

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const Icon = TYPE_ICONS[node.type];

  return (
    <div className="absolute right-4 top-4 w-80 bg-background border rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-5 h-5", TYPE_COLORS[node.type])} />
          <span className="font-semibold capitalize">{node.type} Details</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{node.label}</h3>
        </div>

        {/* Org Unit details */}
        {node.orgUnit && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-20">Type:</span>
              <span className="capitalize font-medium">{node.orgUnit.type}</span>
            </div>
            {node.orgUnit.parentId && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">Parent ID:</span>
                <span>{node.orgUnit.parentId}</span>
              </div>
            )}
          </div>
        )}

        {/* Employee details */}
        {node.employee && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{node.employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-20">Level:</span>
              <span className="capitalize">{node.employee.level.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-20">FTE:</span>
              <span>{node.employee.fteCapacity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Since {node.employee.activeFrom}</span>
            </div>
          </div>
        )}

        {/* Project details */}
        {node.project && (
          <div className="space-y-3">
            {node.project.description && (
              <p className="text-sm text-muted-foreground">{node.project.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium capitalize",
                  STATUS_COLORS[node.project.status]
                )}
              >
                {node.project.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Flag className="w-4 h-4 text-muted-foreground" />
              <span>{priorityLabels[node.project.priority]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {node.project.plannedStart} → {node.project.plannedEnd}
              </span>
            </div>
            {node.project.portfolioGroup && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">Group:</span>
                <span>{node.project.portfolioGroup}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
