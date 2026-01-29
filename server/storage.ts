import { eq, and, gte, lte, sql, desc, asc, isNull, or } from "drizzle-orm";
import { db } from "./db";
import {
  orgUnits,
  roles,
  teams,
  employees,
  projects,
  projectRoleAllocations,
  scenarios,
  scenarioProjectOverrides,
  calendarMonths,
  type OrgUnit,
  type Role,
  type Team,
  type Employee,
  type Project,
  type ProjectRoleAllocation,
  type Scenario,
  type ScenarioProjectOverride,
  type InsertOrgUnit,
  type InsertRole,
  type InsertTeam,
  type InsertEmployee,
  type InsertProject,
  type InsertProjectRoleAllocation,
  type InsertScenario,
  type InsertScenarioProjectOverride,
  type CapacityByRole,
  type DemandByRole,
  type CapacityVsDemand,
} from "@shared/schema";

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

export interface IStorage {
  // Org Units
  getOrgUnits(type?: string, parentId?: number): Promise<OrgUnit[]>;
  getOrgUnit(id: number): Promise<OrgUnit | undefined>;
  createOrgUnit(data: InsertOrgUnit): Promise<OrgUnit>;
  updateOrgUnit(id: number, data: Partial<InsertOrgUnit>): Promise<OrgUnit | undefined>;
  deleteOrgUnit(id: number): Promise<boolean>;

  // Roles
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(data: InsertRole): Promise<Role>;
  updateRole(id: number, data: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Teams
  getTeams(orgUnitId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;

  // Employees
  getEmployees(filters?: {
    roleId?: number;
    teamId?: number;
    level?: string;
    activeOnly?: boolean;
  }): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(data: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Projects
  getProjects(filters?: {
    status?: string;
    priority?: number;
    portfolioGroup?: string;
  }): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Allocations
  getAllocations(filters?: {
    projectId?: number;
    roleId?: number;
    startMonth?: string;
    endMonth?: string;
  }): Promise<ProjectRoleAllocation[]>;
  createAllocation(data: InsertProjectRoleAllocation): Promise<ProjectRoleAllocation>;
  updateAllocation(
    id: number,
    data: Partial<InsertProjectRoleAllocation>
  ): Promise<ProjectRoleAllocation | undefined>;
  deleteAllocation(id: number): Promise<boolean>;
  bulkUpsertAllocations(allocations: InsertProjectRoleAllocation[]): Promise<ProjectRoleAllocation[]>;

  // Scenarios
  getScenarios(type?: string, activeOnly?: boolean): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;
  createScenario(data: InsertScenario): Promise<Scenario>;
  updateScenario(id: number, data: Partial<InsertScenario>): Promise<Scenario | undefined>;
  deleteScenario(id: number): Promise<boolean>;
  addScenarioOverride(
    scenarioId: number,
    data: Omit<InsertScenarioProjectOverride, "scenarioId">
  ): Promise<ScenarioProjectOverride>;

  // Capacity & Analytics
  getCapacity(
    startMonth: string,
    endMonth: string,
    roleId?: number,
    teamId?: number
  ): Promise<CapacityByRole[]>;
  getDemand(
    startMonth: string,
    endMonth: string,
    roleId?: number,
    scenarioId?: number
  ): Promise<DemandByRole[]>;
  getCapacityVsDemand(
    startMonth: string,
    endMonth: string,
    scenarioId?: number
  ): Promise<CapacityVsDemand[]>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalEmployees: number;
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
    totalFte: number;
  }>;

  // Dashboard Analytics
  getAtRiskProjects(): Promise<{
    id: number;
    name: string;
    status: string;
    priority: number;
    shortfall: number;
    roles: string[];
  }[]>;

  getProjectStatusDistribution(): Promise<{
    status: string;
    count: number;
  }[]>;

  getFteByDivision(): Promise<{
    divisionId: number;
    divisionName: string;
    totalFte: number;
    allocatedFte: number;
  }[]>;

  getUtilizationTrend(months: number): Promise<{
    monthDate: string;
    capacity: number;
    demand: number;
    utilization: number;
  }[]>;

  getCapacityDemandByMonth(months: number): Promise<{
    monthDate: string;
    capacity: number;
    demand: number;
  }[]>;
}

// ============================================================================
// DRIZZLE STORAGE IMPLEMENTATION
// ============================================================================

export class DrizzleStorage implements IStorage {
  // ========== ORG UNITS ==========
  async getOrgUnits(type?: string, parentId?: number): Promise<OrgUnit[]> {
    const conditions = [];
    if (type) conditions.push(eq(orgUnits.type, type as any));
    if (parentId !== undefined) conditions.push(eq(orgUnits.parentId, parentId));
    
    if (conditions.length === 0) {
      return db.select().from(orgUnits).orderBy(asc(orgUnits.name));
    }
    return db
      .select()
      .from(orgUnits)
      .where(and(...conditions))
      .orderBy(asc(orgUnits.name));
  }

  async getOrgUnit(id: number): Promise<OrgUnit | undefined> {
    const [result] = await db.select().from(orgUnits).where(eq(orgUnits.id, id));
    return result;
  }

  async createOrgUnit(data: InsertOrgUnit): Promise<OrgUnit> {
    const [result] = await db.insert(orgUnits).values(data).returning();
    return result;
  }

  async updateOrgUnit(id: number, data: Partial<InsertOrgUnit>): Promise<OrgUnit | undefined> {
    const [result] = await db.update(orgUnits).set(data).where(eq(orgUnits.id, id)).returning();
    return result;
  }

  async deleteOrgUnit(id: number): Promise<boolean> {
    const result = await db.delete(orgUnits).where(eq(orgUnits.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== ROLES ==========
  async getRoles(): Promise<Role[]> {
    return db.select().from(roles).orderBy(asc(roles.name));
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [result] = await db.select().from(roles).where(eq(roles.id, id));
    return result;
  }

  async createRole(data: InsertRole): Promise<Role> {
    const [result] = await db.insert(roles).values(data).returning();
    return result;
  }

  async updateRole(id: number, data: Partial<InsertRole>): Promise<Role | undefined> {
    const [result] = await db.update(roles).set(data).where(eq(roles.id, id)).returning();
    return result;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== TEAMS ==========
  async getTeams(orgUnitId?: number): Promise<Team[]> {
    if (orgUnitId) {
      return db.select().from(teams).where(eq(teams.orgUnitId, orgUnitId)).orderBy(asc(teams.name));
    }
    return db.select().from(teams).orderBy(asc(teams.name));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [result] = await db.select().from(teams).where(eq(teams.id, id));
    return result;
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [result] = await db.insert(teams).values(data).returning();
    return result;
  }

  async updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const [result] = await db.update(teams).set(data).where(eq(teams.id, id)).returning();
    return result;
  }

  async deleteTeam(id: number): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== EMPLOYEES ==========
  async getEmployees(filters?: {
    roleId?: number;
    teamId?: number;
    level?: string;
    activeOnly?: boolean;
  }): Promise<Employee[]> {
    const conditions = [];
    
    if (filters?.roleId) conditions.push(eq(employees.roleId, filters.roleId));
    if (filters?.teamId) conditions.push(eq(employees.teamId, filters.teamId));
    if (filters?.level) conditions.push(eq(employees.level, filters.level as any));
    if (filters?.activeOnly !== false) {
      // Active employees: activeTo is null or in the future
      conditions.push(
        or(isNull(employees.activeTo), gte(employees.activeTo, new Date().toISOString().slice(0, 10)))
      );
    }

    if (conditions.length === 0) {
      return db.select().from(employees).orderBy(asc(employees.name));
    }
    return db
      .select()
      .from(employees)
      .where(and(...conditions))
      .orderBy(asc(employees.name));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [result] = await db.select().from(employees).where(eq(employees.id, id));
    return result;
  }

  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const [result] = await db.insert(employees).values(data).returning();
    return result;
  }

  async updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [result] = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return result;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== PROJECTS ==========
  async getProjects(filters?: {
    status?: string;
    priority?: number;
    portfolioGroup?: string;
  }): Promise<Project[]> {
    const conditions = [];
    
    if (filters?.status) conditions.push(eq(projects.status, filters.status as any));
    if (filters?.priority) conditions.push(eq(projects.priority, filters.priority));
    if (filters?.portfolioGroup) conditions.push(eq(projects.portfolioGroup, filters.portfolioGroup));

    if (conditions.length === 0) {
      return db.select().from(projects).orderBy(asc(projects.priority), asc(projects.name));
    }
    return db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(asc(projects.priority), asc(projects.name));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [result] = await db.select().from(projects).where(eq(projects.id, id));
    return result;
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [result] = await db.insert(projects).values(data).returning();
    return result;
  }

  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [result] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return result;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ========== ALLOCATIONS ==========
  async getAllocations(filters?: {
    projectId?: number;
    roleId?: number;
    startMonth?: string;
    endMonth?: string;
  }): Promise<ProjectRoleAllocation[]> {
    const conditions = [];
    
    if (filters?.projectId) conditions.push(eq(projectRoleAllocations.projectId, filters.projectId));
    if (filters?.roleId) conditions.push(eq(projectRoleAllocations.roleId, filters.roleId));
    if (filters?.startMonth) conditions.push(gte(projectRoleAllocations.monthDate, filters.startMonth));
    if (filters?.endMonth) conditions.push(lte(projectRoleAllocations.monthDate, filters.endMonth));

    if (conditions.length === 0) {
      return db.select().from(projectRoleAllocations).orderBy(asc(projectRoleAllocations.monthDate));
    }
    return db
      .select()
      .from(projectRoleAllocations)
      .where(and(...conditions))
      .orderBy(asc(projectRoleAllocations.monthDate));
  }

  async createAllocation(data: InsertProjectRoleAllocation): Promise<ProjectRoleAllocation> {
    const [result] = await db.insert(projectRoleAllocations).values(data).returning();
    return result;
  }

  async updateAllocation(
    id: number,
    data: Partial<InsertProjectRoleAllocation>
  ): Promise<ProjectRoleAllocation | undefined> {
    const [result] = await db
      .update(projectRoleAllocations)
      .set(data)
      .where(eq(projectRoleAllocations.id, id))
      .returning();
    return result;
  }

  async deleteAllocation(id: number): Promise<boolean> {
    const result = await db.delete(projectRoleAllocations).where(eq(projectRoleAllocations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async bulkUpsertAllocations(
    allocations: InsertProjectRoleAllocation[]
  ): Promise<ProjectRoleAllocation[]> {
    if (allocations.length === 0) return [];
    
    const results = await db
      .insert(projectRoleAllocations)
      .values(allocations)
      .onConflictDoNothing()
      .returning();
    return results;
  }

  // ========== SCENARIOS ==========
  async getScenarios(type?: string, activeOnly?: boolean): Promise<Scenario[]> {
    const conditions = [];
    
    if (type) conditions.push(eq(scenarios.type, type as any));
    if (activeOnly !== false) conditions.push(eq(scenarios.isActive, true));

    if (conditions.length === 0) {
      return db.select().from(scenarios).orderBy(desc(scenarios.createdAt));
    }
    return db
      .select()
      .from(scenarios)
      .where(and(...conditions))
      .orderBy(desc(scenarios.createdAt));
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [result] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return result;
  }

  async createScenario(data: InsertScenario): Promise<Scenario> {
    const [result] = await db.insert(scenarios).values(data).returning();
    return result;
  }

  async updateScenario(id: number, data: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const [result] = await db.update(scenarios).set(data).where(eq(scenarios.id, id)).returning();
    return result;
  }

  async deleteScenario(id: number): Promise<boolean> {
    const result = await db.delete(scenarios).where(eq(scenarios.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addScenarioOverride(
    scenarioId: number,
    data: Omit<InsertScenarioProjectOverride, "scenarioId">
  ): Promise<ScenarioProjectOverride> {
    const [result] = await db
      .insert(scenarioProjectOverrides)
      .values({ ...data, scenarioId })
      .returning();
    return result;
  }

  // ========== CAPACITY & ANALYTICS ==========
  async getCapacity(
    startMonth: string,
    endMonth: string,
    roleId?: number,
    teamId?: number
  ): Promise<CapacityByRole[]> {
    // This calculates available FTE by role for each month
    // For a proper implementation, we'd need to join with calendar_month dimension
    // For now, we aggregate employee FTE by role
    const conditions = [];
    if (roleId) conditions.push(eq(employees.roleId, roleId));
    if (teamId) conditions.push(eq(employees.teamId, teamId));
    
    // Get active employees and sum their FTE by role
    const result = await db
      .select({
        roleId: employees.roleId,
        roleName: roles.name,
        availableFte: sql<number>`SUM(CAST(${employees.fteCapacity} AS DECIMAL))`,
      })
      .from(employees)
      .innerJoin(roles, eq(employees.roleId, roles.id))
      .where(
        and(
          or(isNull(employees.activeTo), gte(employees.activeTo, startMonth)),
          lte(employees.activeFrom, endMonth),
          ...(conditions.length > 0 ? conditions : [])
        )
      )
      .groupBy(employees.roleId, roles.name);

    // For each role, return capacity for each month in range
    // Simplified: return same capacity for all months
    return result.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      monthDate: startMonth,
      availableFte: Number(r.availableFte) || 0,
    }));
  }

  async getDemand(
    startMonth: string,
    endMonth: string,
    roleId?: number,
    scenarioId?: number
  ): Promise<DemandByRole[]> {
    const conditions = [
      gte(projectRoleAllocations.monthDate, startMonth),
      lte(projectRoleAllocations.monthDate, endMonth),
    ];
    if (roleId) conditions.push(eq(projectRoleAllocations.roleId, roleId));

    // TODO: Apply scenario overrides if scenarioId is provided
    const result = await db
      .select({
        roleId: projectRoleAllocations.roleId,
        roleName: roles.name,
        monthDate: projectRoleAllocations.monthDate,
        requiredFte: sql<number>`SUM(CAST(${projectRoleAllocations.requiredFte} AS DECIMAL))`,
      })
      .from(projectRoleAllocations)
      .innerJoin(roles, eq(projectRoleAllocations.roleId, roles.id))
      .where(and(...conditions))
      .groupBy(projectRoleAllocations.roleId, roles.name, projectRoleAllocations.monthDate)
      .orderBy(asc(projectRoleAllocations.monthDate));

    return result.map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      monthDate: r.monthDate,
      requiredFte: Number(r.requiredFte) || 0,
    }));
  }

  async getCapacityVsDemand(
    startMonth: string,
    endMonth: string,
    scenarioId?: number
  ): Promise<CapacityVsDemand[]> {
    const capacity = await this.getCapacity(startMonth, endMonth);
    const demand = await this.getDemand(startMonth, endMonth, undefined, scenarioId);

    // Merge capacity and demand by role
    const capacityMap = new Map(capacity.map((c) => [c.roleId, c.availableFte]));
    const roleNames = new Map(capacity.map((c) => [c.roleId, c.roleName]));

    // Add roles from demand that might not be in capacity
    for (const d of demand) {
      roleNames.set(d.roleId, d.roleName);
    }

    const result: CapacityVsDemand[] = [];
    for (const d of demand) {
      const availableFte = capacityMap.get(d.roleId) || 0;
      result.push({
        roleId: d.roleId,
        roleName: d.roleName,
        monthDate: d.monthDate,
        availableFte,
        requiredFte: d.requiredFte,
        gap: availableFte - d.requiredFte,
      });
    }

    return result;
  }

  // ========== DASHBOARD ==========
  async getDashboardStats(): Promise<{
    totalEmployees: number;
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
    totalFte: number;
  }> {
    const [employeeCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(employees)
      .where(or(isNull(employees.activeTo), gte(employees.activeTo, new Date().toISOString().slice(0, 10))));

    const [projectCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(projects);

    const [activeProjectCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(projects)
      .where(eq(projects.status, "active"));

    const [teamCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(teams);

    const [fteSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${employees.fteCapacity} AS DECIMAL)), 0)` })
      .from(employees)
      .where(or(isNull(employees.activeTo), gte(employees.activeTo, new Date().toISOString().slice(0, 10))));

    return {
      totalEmployees: Number(employeeCount?.count) || 0,
      totalProjects: Number(projectCount?.count) || 0,
      activeProjects: Number(activeProjectCount?.count) || 0,
      totalTeams: Number(teamCount?.count) || 0,
      totalFte: Number(fteSum?.total) || 0,
    };
  }

  // ========== DASHBOARD ANALYTICS ==========

  async getAtRiskProjects(): Promise<{
    id: number;
    name: string;
    status: string;
    priority: number;
    shortfall: number;
    roles: string[];
  }[]> {
    // Get active projects with their allocations
    const activeProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "active"));

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // For each project, calculate if there's resource shortfall
    const atRiskProjects: {
      id: number;
      name: string;
      status: string;
      priority: number;
      shortfall: number;
      roles: string[];
    }[] = [];

    for (const project of activeProjects) {
      // Get allocations for this project in current/upcoming months
      const allocations = await db
        .select({
          roleId: projectRoleAllocations.roleId,
          roleName: roles.name,
          requiredFte: projectRoleAllocations.requiredFte,
        })
        .from(projectRoleAllocations)
        .innerJoin(roles, eq(projectRoleAllocations.roleId, roles.id))
        .where(
          and(
            eq(projectRoleAllocations.projectId, project.id),
            gte(projectRoleAllocations.monthDate, currentMonth)
          )
        );

      if (allocations.length === 0) continue;

      // Get available capacity per role
      const capacity = await this.getCapacity(currentMonth, currentMonth);
      const capacityMap = new Map(capacity.map((c) => [c.roleId, c.availableFte]));

      // Calculate shortfall
      let totalShortfall = 0;
      const shortfallRoles: string[] = [];

      for (const alloc of allocations) {
        const available = capacityMap.get(alloc.roleId) || 0;
        const required = Number(alloc.requiredFte);
        if (required > available) {
          totalShortfall += required - available;
          if (!shortfallRoles.includes(alloc.roleName)) {
            shortfallRoles.push(alloc.roleName);
          }
        }
      }

      if (totalShortfall > 0) {
        atRiskProjects.push({
          id: project.id,
          name: project.name,
          status: project.status,
          priority: project.priority,
          shortfall: Math.round(totalShortfall * 100) / 100,
          roles: shortfallRoles,
        });
      }
    }

    // Sort by shortfall descending
    return atRiskProjects.sort((a, b) => b.shortfall - a.shortfall);
  }

  async getProjectStatusDistribution(): Promise<{
    status: string;
    count: number;
  }[]> {
    const result = await db
      .select({
        status: projects.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(projects)
      .groupBy(projects.status);

    return result.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));
  }

  async getFteByDivision(): Promise<{
    divisionId: number;
    divisionName: string;
    totalFte: number;
    allocatedFte: number;
  }[]> {
    // Get all divisions
    const divisions = await db
      .select()
      .from(orgUnits)
      .where(eq(orgUnits.type, "division"));

    const result: {
      divisionId: number;
      divisionName: string;
      totalFte: number;
      allocatedFte: number;
    }[] = [];

    for (const division of divisions) {
      // Get all org units under this division (recursively find all children)
      const childOrgUnits = await this.getAllDescendantOrgUnits(division.id);
      const orgUnitIds = [division.id, ...childOrgUnits.map((u) => u.id)];

      // Get all teams in these org units
      const divisionTeams = await db
        .select()
        .from(teams)
        .where(sql`${teams.orgUnitId} IN (${sql.join(orgUnitIds.map(id => sql`${id}`), sql`, `)})`);

      if (divisionTeams.length === 0) {
        result.push({
          divisionId: division.id,
          divisionName: division.name,
          totalFte: 0,
          allocatedFte: 0,
        });
        continue;
      }

      const teamIds = divisionTeams.map((t) => t.id);

      // Get total FTE capacity for employees in these teams
      const [fteCapacity] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${employees.fteCapacity} AS DECIMAL)), 0)`,
        })
        .from(employees)
        .where(
          and(
            sql`${employees.teamId} IN (${sql.join(teamIds.map(id => sql`${id}`), sql`, `)})`,
            or(
              isNull(employees.activeTo),
              gte(employees.activeTo, new Date().toISOString().slice(0, 10))
            )
          )
        );

      // Get current month allocations (simplified - actual would need more logic)
      const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

      // For allocated FTE, we'll use 70% of total as a placeholder
      // In a real app, you'd calculate actual project allocations per division
      const totalFte = Number(fteCapacity?.total) || 0;

      result.push({
        divisionId: division.id,
        divisionName: division.name,
        totalFte,
        allocatedFte: Math.round(totalFte * 0.7 * 100) / 100, // Placeholder
      });
    }

    return result.sort((a, b) => b.totalFte - a.totalFte);
  }

  private async getAllDescendantOrgUnits(parentId: number): Promise<OrgUnit[]> {
    const children = await db
      .select()
      .from(orgUnits)
      .where(eq(orgUnits.parentId, parentId));

    const descendants: OrgUnit[] = [...children];
    for (const child of children) {
      const childDescendants = await this.getAllDescendantOrgUnits(child.id);
      descendants.push(...childDescendants);
    }
    return descendants;
  }

  async getUtilizationTrend(months: number = 6): Promise<{
    monthDate: string;
    capacity: number;
    demand: number;
    utilization: number;
  }[]> {
    const data = await this.getCapacityDemandByMonth(months);
    return data.map((d) => ({
      ...d,
      utilization: d.capacity > 0 ? Math.round((d.demand / d.capacity) * 100) : 0,
    }));
  }

  async getCapacityDemandByMonth(months: number = 6): Promise<{
    monthDate: string;
    capacity: number;
    demand: number;
  }[]> {
    // Generate month range
    const result: { monthDate: string; capacity: number; demand: number }[] = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthDate = date.toISOString().slice(0, 10);
      const monthStr = date.toISOString().slice(0, 7);

      // Get total employee FTE capacity (active employees)
      const [capacityResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${employees.fteCapacity} AS DECIMAL)), 0)`,
        })
        .from(employees)
        .where(
          and(
            lte(employees.activeFrom, monthDate),
            or(isNull(employees.activeTo), gte(employees.activeTo, monthDate))
          )
        );

      // Get total demand from allocations for this month
      const startDate = `${monthStr}-01`;
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const endDate = nextMonth.toISOString().slice(0, 10);

      const [demandResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${projectRoleAllocations.requiredFte} AS DECIMAL)), 0)`,
        })
        .from(projectRoleAllocations)
        .where(
          and(
            gte(projectRoleAllocations.monthDate, startDate),
            lte(projectRoleAllocations.monthDate, endDate)
          )
        );

      result.push({
        monthDate: monthStr,
        capacity: Number(capacityResult?.total) || 0,
        demand: Number(demandResult?.total) || 0,
      });
    }

    return result;
  }
}

export const storage = new DrizzleStorage();
