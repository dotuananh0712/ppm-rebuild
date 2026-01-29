import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";
import type { OrgUnit, Employee, Project } from "@shared/schema";

export type OrgNodeType = "division" | "function" | "subfunction" | "team" | "employee" | "project";

export interface OrgNodeData extends Record<string, unknown> {
  label: string;
  type: OrgNodeType;
  orgUnit?: OrgUnit;
  employee?: Employee;
  project?: Project;
}

const NODE_COLORS: Record<OrgNodeType, { bg: string; border: string; text: string }> = {
  division: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  function: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
  subfunction: { bg: "#fef9c3", border: "#eab308", text: "#854d0e" },
  team: { bg: "#f3e8ff", border: "#a855f7", text: "#6b21a8" },
  employee: { bg: "#ccfbf1", border: "#14b8a6", text: "#0f766e" },
  project: { bg: "#ffedd5", border: "#f97316", text: "#c2410c" },
};

const NODE_DIMENSIONS: Record<OrgNodeType, { width: number; height: number }> = {
  division: { width: 180, height: 60 },
  function: { width: 160, height: 50 },
  subfunction: { width: 150, height: 45 },
  team: { width: 140, height: 45 },
  employee: { width: 120, height: 40 },
  project: { width: 140, height: 45 },
};

// Simple hierarchical layout algorithm
function applyHierarchicalLayout(
  nodes: Node<OrgNodeData>[],
  edges: Edge[],
  dimensions: Record<OrgNodeType, { width: number; height: number }>
): Node<OrgNodeData>[] {
  if (nodes.length === 0) return nodes;

  // Build adjacency map (parent -> children)
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const edge of edges) {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
    parentMap.set(edge.target, edge.source);
  }

  // Find root nodes (no parent)
  const roots = nodes.filter((n) => !parentMap.has(n.id));

  // Calculate levels for each node
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function assignLevel(nodeId: string, level: number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    levels.set(nodeId, level);
    const children = childrenMap.get(nodeId) || [];
    for (const child of children) {
      assignLevel(child, level + 1);
    }
  }

  for (const root of roots) {
    assignLevel(root.id, 0);
  }

  // For nodes not connected, assign level based on type
  for (const node of nodes) {
    if (!levels.has(node.id)) {
      const typeOrder: Record<OrgNodeType, number> = {
        division: 0,
        function: 1,
        subfunction: 2,
        team: 3,
        employee: 4,
        project: 5,
      };
      levels.set(node.id, typeOrder[node.data.type] || 0);
    }
  }

  // Group nodes by level
  const levelGroups = new Map<number, Node<OrgNodeData>[]>();
  for (const node of nodes) {
    const level = levels.get(node.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(node);
  }

  // Layout constants
  const HORIZONTAL_SPACING = 50;
  const VERTICAL_SPACING = 100;

  // Position nodes
  const positionedNodes: Node<OrgNodeData>[] = [];
  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

  for (const level of sortedLevels) {
    const nodesAtLevel = levelGroups.get(level) || [];
    const totalWidth = nodesAtLevel.reduce((sum, n) => {
      const dims = dimensions[n.data.type];
      return sum + dims.width + HORIZONTAL_SPACING;
    }, -HORIZONTAL_SPACING);

    let currentX = -totalWidth / 2;

    for (const node of nodesAtLevel) {
      const dims = dimensions[node.data.type];
      positionedNodes.push({
        ...node,
        position: {
          x: currentX,
          y: level * (60 + VERTICAL_SPACING),
        },
      });
      currentX += dims.width + HORIZONTAL_SPACING;
    }
  }

  return positionedNodes;
}

export function useOrgGraph(options: {
  showEmployees: boolean;
  showProjects: boolean;
}) {
  const { data: orgUnits, isLoading: loadingOrg } = useQuery<OrgUnit[]>({
    queryKey: ["/api/org-units"],
  });

  const { data: employees, isLoading: loadingEmp } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: options.showEmployees || options.showProjects,
  });

  const { data: projects, isLoading: loadingProj } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: options.showProjects,
  });

  const { data: teams } = useQuery<{ id: number; orgUnitId: number; name: string }[]>({
    queryKey: ["/api/teams"],
    enabled: options.showEmployees,
  });

  const isLoading = loadingOrg || (options.showEmployees && loadingEmp) || (options.showProjects && loadingProj);

  const { nodes, edges } = useMemo(() => {
    if (!orgUnits) return { nodes: [], edges: [] };

    const rawNodes: Node<OrgNodeData>[] = [];
    const rawEdges: Edge[] = [];

    // Add org unit nodes
    for (const unit of orgUnits) {
      rawNodes.push({
        id: `org-${unit.id}`,
        type: "orgNode",
        position: { x: 0, y: 0 },
        data: {
          label: unit.name,
          type: unit.type as OrgNodeType,
          orgUnit: unit,
        },
      });

      // Add edge to parent
      if (unit.parentId) {
        rawEdges.push({
          id: `edge-org-${unit.parentId}-${unit.id}`,
          source: `org-${unit.parentId}`,
          target: `org-${unit.id}`,
          type: "smoothstep",
          animated: false,
        });
      }
    }

    // Add employee nodes if enabled
    if (options.showEmployees && employees && teams) {
      const teamOrgMap = new Map(teams.map((t) => [t.id, t.orgUnitId]));

      for (const emp of employees) {
        rawNodes.push({
          id: `emp-${emp.id}`,
          type: "orgNode",
          position: { x: 0, y: 0 },
          data: {
            label: emp.name,
            type: "employee",
            employee: emp,
          },
        });

        // Connect employee to their team's org unit
        const orgUnitId = teamOrgMap.get(emp.teamId);
        if (orgUnitId) {
          rawEdges.push({
            id: `edge-org-${orgUnitId}-emp-${emp.id}`,
            source: `org-${orgUnitId}`,
            target: `emp-${emp.id}`,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#14b8a6", strokeWidth: 1 },
          });
        }
      }
    }

    // Add project nodes if enabled
    if (options.showProjects && projects && employees) {
      const addedProjects = new Set<number>();

      for (const proj of projects) {
        if (!addedProjects.has(proj.id)) {
          rawNodes.push({
            id: `proj-${proj.id}`,
            type: "orgNode",
            position: { x: 0, y: 0 },
            data: {
              label: proj.name,
              type: "project",
              project: proj,
            },
          });
          addedProjects.add(proj.id);

          // Connect project to its owner if exists
          if (proj.ownerId) {
            rawEdges.push({
              id: `edge-emp-${proj.ownerId}-proj-${proj.id}`,
              source: `emp-${proj.ownerId}`,
              target: `proj-${proj.id}`,
              type: "smoothstep",
              animated: true,
              style: { stroke: "#f97316", strokeWidth: 1 },
            });
          }
        }
      }
    }

    // Simple hierarchical layout
    const layoutedNodes = applyHierarchicalLayout(rawNodes, rawEdges, NODE_DIMENSIONS);

    return { nodes: layoutedNodes, edges: rawEdges };
  }, [orgUnits, employees, projects, teams, options.showEmployees, options.showProjects]);

  return { nodes, edges, isLoading, nodeColors: NODE_COLORS };
}
