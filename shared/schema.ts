import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const orgUnitTypeEnum = pgEnum("org_unit_type", [
  "division",
  "function",
  "subfunction",
  "team",
]);

export const employeeLevelEnum = pgEnum("employee_level", [
  "officer",
  "senior_officer",
  "expert",
  "manager",
  "senior_expert",
  "senior_manager",
  "director",
  "senior_director",
  "chief",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planned",
  "active",
  "paused",
  "cancelled",
]);

export const scenarioTypeEnum = pgEnum("scenario_type", ["BASELINE", "WHAT_IF"]);

// ============================================================================
// TABLES
// ============================================================================

// 1. Organizational Units (Division -> Function -> Subfunction -> Team)
export const orgUnits = pgTable("org_unit", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: orgUnitTypeEnum("type").notNull(),
  parentId: integer("parent_id"), // Self-reference for hierarchy
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Roles (Backend Engineer, Frontend, QA, Data, PM, DM, SA, etc.)
export const roles = pgTable("role", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Teams (Capacity Pools)
export const teams = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  orgUnitId: integer("org_unit_id").notNull(), // References org_unit
  leadEmployeeId: integer("lead_employee_id"), // References employee (nullable until set)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Employees
export const employees = pgTable("employee", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  roleId: integer("role_id").notNull(), // References role
  level: employeeLevelEnum("level").notNull(),
  teamId: integer("team_id").notNull(), // References team
  fteCapacity: decimal("fte_capacity", { precision: 3, scale: 2 })
    .notNull()
    .default("1.00"),
  activeFrom: date("active_from").notNull(),
  activeTo: date("active_to"), // Null means currently active
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Projects
export const projects = pgTable("project", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priority: integer("priority").notNull().default(3), // 1-5 scale (1 = highest)
  plannedStart: date("planned_start").notNull(),
  plannedEnd: date("planned_end").notNull(),
  status: projectStatusEnum("status").notNull().default("planned"),
  portfolioGroup: text("portfolio_group"), // Optional grouping
  ownerId: integer("owner_id"), // References employee
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Project Role Allocations (Monthly FTE by Role)
export const projectRoleAllocations = pgTable("project_role_allocation", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(), // References project
  roleId: integer("role_id").notNull(), // References role
  monthDate: date("month_date").notNull(), // First day of month (e.g., 2026-01-01)
  requiredFte: decimal("required_fte", { precision: 4, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Scenarios (BASELINE and WHAT_IF)
export const scenarios = pgTable("scenario", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: scenarioTypeEnum("type").notNull().default("WHAT_IF"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Scenario Project Overrides
export const scenarioProjectOverrides = pgTable("scenario_project_override", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(), // References scenario
  projectId: integer("project_id").notNull(), // References project
  included: boolean("included").notNull().default(true), // false = dropped from scenario
  startOverride: date("start_override"), // Override planned_start
  endOverride: date("end_override"), // Override planned_end
  priorityOverride: integer("priority_override"), // Override priority
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Calendar Month Dimension
export const calendarMonths = pgTable("calendar_month", {
  monthDate: date("month_date").primaryKey(), // First day of month
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  month: integer("month").notNull(), // 1-12
});

// ============================================================================
// RELATIONS
// ============================================================================

export const orgUnitsRelations = relations(orgUnits, ({ one, many }) => ({
  parent: one(orgUnits, {
    fields: [orgUnits.parentId],
    references: [orgUnits.id],
    relationName: "org_hierarchy",
  }),
  children: many(orgUnits, { relationName: "org_hierarchy" }),
  teams: many(teams),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  employees: many(employees),
  allocations: many(projectRoleAllocations),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  orgUnit: one(orgUnits, {
    fields: [teams.orgUnitId],
    references: [orgUnits.id],
  }),
  lead: one(employees, {
    fields: [teams.leadEmployeeId],
    references: [employees.id],
    relationName: "team_lead",
  }),
  members: many(employees),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  role: one(roles, {
    fields: [employees.roleId],
    references: [roles.id],
  }),
  team: one(teams, {
    fields: [employees.teamId],
    references: [teams.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(employees, {
    fields: [projects.ownerId],
    references: [employees.id],
  }),
  allocations: many(projectRoleAllocations),
  scenarioOverrides: many(scenarioProjectOverrides),
}));

export const projectRoleAllocationsRelations = relations(
  projectRoleAllocations,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectRoleAllocations.projectId],
      references: [projects.id],
    }),
    role: one(roles, {
      fields: [projectRoleAllocations.roleId],
      references: [roles.id],
    }),
  })
);

export const scenariosRelations = relations(scenarios, ({ many }) => ({
  overrides: many(scenarioProjectOverrides),
}));

export const scenarioProjectOverridesRelations = relations(
  scenarioProjectOverrides,
  ({ one }) => ({
    scenario: one(scenarios, {
      fields: [scenarioProjectOverrides.scenarioId],
      references: [scenarios.id],
    }),
    project: one(projects, {
      fields: [scenarioProjectOverrides.projectId],
      references: [projects.id],
    }),
  })
);

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const insertOrgUnitSchema = createInsertSchema(orgUnits).omit({
  id: true,
  createdAt: true,
});
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});
export const insertProjectRoleAllocationSchema = createInsertSchema(
  projectRoleAllocations
).omit({ id: true, createdAt: true });
export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
});
export const insertScenarioProjectOverrideSchema = createInsertSchema(
  scenarioProjectOverrides
).omit({ id: true, createdAt: true });
export const insertCalendarMonthSchema = createInsertSchema(calendarMonths);

// ============================================================================
// TYPES
// ============================================================================

export type OrgUnit = typeof orgUnits.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectRoleAllocation = typeof projectRoleAllocations.$inferSelect;
export type Scenario = typeof scenarios.$inferSelect;
export type ScenarioProjectOverride =
  typeof scenarioProjectOverrides.$inferSelect;
export type CalendarMonth = typeof calendarMonths.$inferSelect;

export type InsertOrgUnit = z.infer<typeof insertOrgUnitSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertProjectRoleAllocation = z.infer<
  typeof insertProjectRoleAllocationSchema
>;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type InsertScenarioProjectOverride = z.infer<
  typeof insertScenarioProjectOverrideSchema
>;
export type InsertCalendarMonth = z.infer<typeof insertCalendarMonthSchema>;

// ============================================================================
// EXTENDED TYPES (for API responses)
// ============================================================================

export type EmployeeWithRelations = Employee & {
  role: Role;
  team: Team;
};

export type ProjectWithAllocations = Project & {
  allocations: ProjectRoleAllocation[];
  owner: Employee | null;
};

export type TeamWithMembers = Team & {
  members: Employee[];
  lead: Employee | null;
  orgUnit: OrgUnit;
};

export type ScenarioWithOverrides = Scenario & {
  overrides: ScenarioProjectOverride[];
};

// Capacity calculation types
export type CapacityByRole = {
  roleId: number;
  roleName: string;
  monthDate: string;
  availableFte: number;
};

export type DemandByRole = {
  roleId: number;
  roleName: string;
  monthDate: string;
  requiredFte: number;
};

export type CapacityVsDemand = {
  roleId: number;
  roleName: string;
  monthDate: string;
  availableFte: number;
  requiredFte: number;
  gap: number; // positive = surplus, negative = shortage
};
