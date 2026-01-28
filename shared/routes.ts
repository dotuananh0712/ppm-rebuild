import { z } from "zod";
import {
  insertOrgUnitSchema,
  insertRoleSchema,
  insertTeamSchema,
  insertEmployeeSchema,
  insertProjectSchema,
  insertProjectRoleAllocationSchema,
  insertScenarioSchema,
  insertScenarioProjectOverrideSchema,
} from "./schema";

// ============================================================================
// API ROUTE DEFINITIONS
// ============================================================================

// Standard response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// Pagination params
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// ORG UNITS
// ============================================================================

export const orgUnitRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/org-units",
    querySchema: paginationSchema.extend({
      type: z.enum(["division", "function", "subfunction", "team"]).optional(),
      parentId: z.coerce.number().optional(),
    }),
  },
  get: {
    method: "GET" as const,
    path: "/api/org-units/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/org-units",
    bodySchema: insertOrgUnitSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/org-units/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertOrgUnitSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/org-units/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// ROLES
// ============================================================================

export const roleRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/roles",
    querySchema: paginationSchema,
  },
  get: {
    method: "GET" as const,
    path: "/api/roles/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/roles",
    bodySchema: insertRoleSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/roles/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertRoleSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/roles/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// TEAMS
// ============================================================================

export const teamRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/teams",
    querySchema: paginationSchema.extend({
      orgUnitId: z.coerce.number().optional(),
    }),
  },
  get: {
    method: "GET" as const,
    path: "/api/teams/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/teams",
    bodySchema: insertTeamSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/teams/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertTeamSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/teams/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// EMPLOYEES
// ============================================================================

export const employeeRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/employees",
    querySchema: paginationSchema.extend({
      roleId: z.coerce.number().optional(),
      teamId: z.coerce.number().optional(),
      level: z.string().optional(),
      activeOnly: z.coerce.boolean().default(true),
    }),
  },
  get: {
    method: "GET" as const,
    path: "/api/employees/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/employees",
    bodySchema: insertEmployeeSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/employees/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertEmployeeSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/employees/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// PROJECTS
// ============================================================================

export const projectRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/projects",
    querySchema: paginationSchema.extend({
      status: z.enum(["planned", "active", "paused", "cancelled"]).optional(),
      priority: z.coerce.number().optional(),
      portfolioGroup: z.string().optional(),
    }),
  },
  get: {
    method: "GET" as const,
    path: "/api/projects/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/projects",
    bodySchema: insertProjectSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/projects/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertProjectSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/projects/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// ALLOCATIONS
// ============================================================================

export const allocationRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/allocations",
    querySchema: paginationSchema.extend({
      projectId: z.coerce.number().optional(),
      roleId: z.coerce.number().optional(),
      startMonth: z.string().optional(), // YYYY-MM-DD
      endMonth: z.string().optional(),
    }),
  },
  create: {
    method: "POST" as const,
    path: "/api/allocations",
    bodySchema: insertProjectRoleAllocationSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/allocations/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertProjectRoleAllocationSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/allocations/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  bulkUpsert: {
    method: "POST" as const,
    path: "/api/allocations/bulk",
    bodySchema: z.object({
      allocations: z.array(insertProjectRoleAllocationSchema),
    }),
  },
};

// ============================================================================
// SCENARIOS
// ============================================================================

export const scenarioRoutes = {
  list: {
    method: "GET" as const,
    path: "/api/scenarios",
    querySchema: paginationSchema.extend({
      type: z.enum(["BASELINE", "WHAT_IF"]).optional(),
      activeOnly: z.coerce.boolean().default(true),
    }),
  },
  get: {
    method: "GET" as const,
    path: "/api/scenarios/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  create: {
    method: "POST" as const,
    path: "/api/scenarios",
    bodySchema: insertScenarioSchema,
  },
  update: {
    method: "PUT" as const,
    path: "/api/scenarios/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertScenarioSchema.partial(),
  },
  delete: {
    method: "DELETE" as const,
    path: "/api/scenarios/:id",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
  addOverride: {
    method: "POST" as const,
    path: "/api/scenarios/:id/overrides",
    paramsSchema: z.object({ id: z.coerce.number() }),
    bodySchema: insertScenarioProjectOverrideSchema.omit({ scenarioId: true }),
  },
  compare: {
    method: "GET" as const,
    path: "/api/scenarios/:id/compare",
    paramsSchema: z.object({ id: z.coerce.number() }),
  },
};

// ============================================================================
// CAPACITY & ANALYTICS
// ============================================================================

export const capacityRoutes = {
  getCapacity: {
    method: "GET" as const,
    path: "/api/capacity",
    querySchema: z.object({
      startMonth: z.string(), // YYYY-MM-DD
      endMonth: z.string(),
      roleId: z.coerce.number().optional(),
      teamId: z.coerce.number().optional(),
    }),
  },
  getDemand: {
    method: "GET" as const,
    path: "/api/demand",
    querySchema: z.object({
      startMonth: z.string(),
      endMonth: z.string(),
      roleId: z.coerce.number().optional(),
      scenarioId: z.coerce.number().optional(),
    }),
  },
  getCapacityVsDemand: {
    method: "GET" as const,
    path: "/api/capacity-vs-demand",
    querySchema: z.object({
      startMonth: z.string(),
      endMonth: z.string(),
      scenarioId: z.coerce.number().optional(),
    }),
  },
  getAllocationResolution: {
    method: "GET" as const,
    path: "/api/allocation-resolution",
    querySchema: z.object({
      month: z.string(),
      scenarioId: z.coerce.number().optional(),
    }),
  },
};

// ============================================================================
// DASHBOARD
// ============================================================================

export const dashboardRoutes = {
  getStats: {
    method: "GET" as const,
    path: "/api/dashboard/stats",
  },
  getCapacityOverview: {
    method: "GET" as const,
    path: "/api/dashboard/capacity-overview",
    querySchema: z.object({
      months: z.coerce.number().int().positive().default(6),
    }),
  },
  getAtRiskProjects: {
    method: "GET" as const,
    path: "/api/dashboard/at-risk-projects",
  },
};

// ============================================================================
// URL BUILDER HELPER
// ============================================================================

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
