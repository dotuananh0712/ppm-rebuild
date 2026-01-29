import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useOrgGraph, type OrgNodeData } from "@/hooks/use-org-graph";
import { OrgNode } from "./OrgNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const nodeTypes: NodeTypes = {
  orgNode: OrgNode as any,
};

interface OrgKnowledgeGraphProps {
  className?: string;
}

export function OrgKnowledgeGraph({ className }: OrgKnowledgeGraphProps) {
  const [showEmployees, setShowEmployees] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);

  const { nodes: initialNodes, edges: initialEdges, isLoading } = useOrgGraph({
    showEmployees,
    showProjects,
  });

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node.data as OrgNodeData);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-lg" />;
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex items-center gap-6 mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Switch
            id="show-employees"
            checked={showEmployees}
            onCheckedChange={setShowEmployees}
          />
          <Label htmlFor="show-employees" className="text-sm cursor-pointer">
            Show Employees
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-projects"
            checked={showProjects}
            onCheckedChange={setShowProjects}
          />
          <Label htmlFor="show-projects" className="text-sm cursor-pointer">
            Show Projects
          </Label>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
            <span>Division</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
            <span>Function</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400" />
            <span>Subfunction</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-200 border border-purple-400" />
            <span>Team</span>
          </div>
          {showEmployees && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-teal-200 border border-teal-400" />
              <span>Employee</span>
            </div>
          )}
          {showProjects && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-200 border border-orange-400" />
              <span>Project</span>
            </div>
          )}
        </div>
      </div>

      {/* Graph */}
      <div className="h-[600px] border rounded-lg bg-background relative">
        <ReactFlow
          nodes={initialNodes as any}
          edges={initialEdges}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#94a3b8", strokeWidth: 1.5 },
          }}
        >
          <Background color="#e2e8f0" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node: any) => {
              const data = node.data as OrgNodeData;
              switch (data.type) {
                case "division":
                  return "#93c5fd";
                case "function":
                  return "#86efac";
                case "subfunction":
                  return "#fde047";
                case "team":
                  return "#d8b4fe";
                case "employee":
                  return "#5eead4";
                case "project":
                  return "#fdba74";
                default:
                  return "#e2e8f0";
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Detail Panel */}
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
}
