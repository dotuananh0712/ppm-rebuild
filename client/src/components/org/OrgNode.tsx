import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { OrgNodeData, OrgNodeType } from "@/hooks/use-org-graph";
import { Building2, Users, UserCircle, FolderKanban, Briefcase, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_STYLES: Record<OrgNodeType, { bg: string; border: string; text: string; icon: typeof Building2 }> = {
  division: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-800", icon: Building2 },
  function: { bg: "bg-green-50", border: "border-green-400", text: "text-green-800", icon: Network },
  subfunction: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-800", icon: Briefcase },
  team: { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-800", icon: Users },
  employee: { bg: "bg-teal-50", border: "border-teal-400", text: "text-teal-800", icon: UserCircle },
  project: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-800", icon: FolderKanban },
};

interface OrgNodeProps {
  data: OrgNodeData;
  selected?: boolean;
}

function OrgNodeComponent({ data, selected }: OrgNodeProps) {
  const style = NODE_STYLES[data.type];
  const Icon = style.icon;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div
        className={cn(
          "px-3 py-2 rounded-lg border-2 shadow-sm transition-shadow",
          style.bg,
          style.border,
          selected && "ring-2 ring-offset-2 ring-blue-500 shadow-md"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", style.text)} />
          <div className="flex flex-col">
            <span className={cn("font-medium text-sm truncate max-w-[120px]", style.text)}>
              {data.label}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{data.type}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </>
  );
}

export const OrgNode = memo(OrgNodeComponent);
