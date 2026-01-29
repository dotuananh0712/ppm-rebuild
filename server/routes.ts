import express, { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  orgUnitRoutes,
  roleRoutes,
  teamRoutes,
  employeeRoutes,
  projectRoutes,
  allocationRoutes,
  scenarioRoutes,
  capacityRoutes,
  dashboardRoutes,
} from "@shared/routes";

const router = express.Router();

// ============================================================================
// ERROR HANDLER
// ============================================================================

function handleError(res: Response, error: unknown) {
  console.error("API Error:", error);
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, error: error.errors });
  }
  return res.status(500).json({
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

// ============================================================================
// ORG UNITS
// ============================================================================

router.get("/org-units", async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const data = await storage.getOrgUnits(
      type as string | undefined,
      parentId ? Number(parentId) : undefined
    );
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/org-units/:id", async (req, res) => {
  try {
    const data = await storage.getOrgUnit(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/org-units", async (req, res) => {
  try {
    const validated = orgUnitRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createOrgUnit(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/org-units/:id", async (req, res) => {
  try {
    const validated = orgUnitRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateOrgUnit(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/org-units/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteOrgUnit(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// ROLES
// ============================================================================

router.get("/roles", async (req, res) => {
  try {
    const data = await storage.getRoles();
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/roles/:id", async (req, res) => {
  try {
    const data = await storage.getRole(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/roles", async (req, res) => {
  try {
    const validated = roleRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createRole(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/roles/:id", async (req, res) => {
  try {
    const validated = roleRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateRole(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/roles/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteRole(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// TEAMS
// ============================================================================

router.get("/teams", async (req, res) => {
  try {
    const { orgUnitId } = req.query;
    const data = await storage.getTeams(orgUnitId ? Number(orgUnitId) : undefined);
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/teams/:id", async (req, res) => {
  try {
    const data = await storage.getTeam(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/teams", async (req, res) => {
  try {
    const validated = teamRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createTeam(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/teams/:id", async (req, res) => {
  try {
    const validated = teamRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateTeam(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/teams/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteTeam(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// EMPLOYEES
// ============================================================================

router.get("/employees", async (req, res) => {
  try {
    const { roleId, teamId, level, activeOnly } = req.query;
    const data = await storage.getEmployees({
      roleId: roleId ? Number(roleId) : undefined,
      teamId: teamId ? Number(teamId) : undefined,
      level: level as string | undefined,
      activeOnly: activeOnly !== "false",
    });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/employees/:id", async (req, res) => {
  try {
    const data = await storage.getEmployee(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/employees", async (req, res) => {
  try {
    const validated = employeeRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createEmployee(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/employees/:id", async (req, res) => {
  try {
    const validated = employeeRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateEmployee(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteEmployee(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// PROJECTS
// ============================================================================

router.get("/projects", async (req, res) => {
  try {
    const { status, priority, portfolioGroup } = req.query;
    const data = await storage.getProjects({
      status: status as string | undefined,
      priority: priority ? Number(priority) : undefined,
      portfolioGroup: portfolioGroup as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const data = await storage.getProject(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/projects", async (req, res) => {
  try {
    const validated = projectRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createProject(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const validated = projectRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateProject(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteProject(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// ALLOCATIONS
// ============================================================================

router.get("/allocations", async (req, res) => {
  try {
    const { projectId, roleId, startMonth, endMonth } = req.query;
    const data = await storage.getAllocations({
      projectId: projectId ? Number(projectId) : undefined,
      roleId: roleId ? Number(roleId) : undefined,
      startMonth: startMonth as string | undefined,
      endMonth: endMonth as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/allocations", async (req, res) => {
  try {
    const validated = allocationRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createAllocation(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/allocations/:id", async (req, res) => {
  try {
    const validated = allocationRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateAllocation(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/allocations/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteAllocation(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/allocations/bulk", async (req, res) => {
  try {
    const validated = allocationRoutes.bulkUpsert.bodySchema.parse(req.body);
    const data = await storage.bulkUpsertAllocations(validated.allocations);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// SCENARIOS
// ============================================================================

router.get("/scenarios", async (req, res) => {
  try {
    const { type, activeOnly } = req.query;
    const data = await storage.getScenarios(
      type as string | undefined,
      activeOnly !== "false"
    );
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/scenarios/:id", async (req, res) => {
  try {
    const data = await storage.getScenario(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/scenarios", async (req, res) => {
  try {
    const validated = scenarioRoutes.create.bodySchema.parse(req.body);
    const data = await storage.createScenario(validated);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/scenarios/:id", async (req, res) => {
  try {
    const validated = scenarioRoutes.update.bodySchema.parse(req.body);
    const data = await storage.updateScenario(Number(req.params.id), validated);
    if (!data) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/scenarios/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteScenario(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/scenarios/:id/overrides", async (req, res) => {
  try {
    const data = await storage.addScenarioOverride(
      Number(req.params.id),
      req.body
    );
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// CAPACITY & ANALYTICS
// ============================================================================

router.get("/capacity", async (req, res) => {
  try {
    const validated = capacityRoutes.getCapacity.querySchema.parse(req.query);
    const data = await storage.getCapacity(
      validated.startMonth,
      validated.endMonth,
      validated.roleId,
      validated.teamId
    );
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/demand", async (req, res) => {
  try {
    const validated = capacityRoutes.getDemand.querySchema.parse(req.query);
    const data = await storage.getDemand(
      validated.startMonth,
      validated.endMonth,
      validated.roleId,
      validated.scenarioId
    );
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/capacity-vs-demand", async (req, res) => {
  try {
    const validated = capacityRoutes.getCapacityVsDemand.querySchema.parse(req.query);
    const data = await storage.getCapacityVsDemand(
      validated.startMonth,
      validated.endMonth,
      validated.scenarioId
    );
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

// ============================================================================
// DASHBOARD
// ============================================================================

router.get("/dashboard/stats", async (req, res) => {
  try {
    const data = await storage.getDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/dashboard/at-risk-projects", async (req, res) => {
  try {
    const data = await storage.getAtRiskProjects();
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/dashboard/project-status", async (req, res) => {
  try {
    const data = await storage.getProjectStatusDistribution();
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/dashboard/fte-by-division", async (req, res) => {
  try {
    const data = await storage.getFteByDivision();
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/dashboard/utilization-trend", async (req, res) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const data = await storage.getUtilizationTrend(months);
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/dashboard/capacity-demand", async (req, res) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const data = await storage.getCapacityDemandByMonth(months);
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
