import { db } from "../server/db";
import {
  orgUnits,
  roles,
  teams,
  employees,
  projects,
  projectRoleAllocations,
  scenarios,
  calendarMonths,
} from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (optional, but good for idempotency if we had cascade delete or clean slate)
  // For now, we'll just insert and assume empty or handling conflicts

  // 1. Calendar Months (2 years)
  console.log("Creating calendar months...");
  const months = [];
  for (let year = 2025; year <= 2027; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const quarter = Math.ceil(month / 3);
      months.push({ monthDate, year, month, quarter });
    }
  }
  await db.insert(calendarMonths).values(months).onConflictDoNothing();

  // 2. Org Units
  console.log("Creating org units...");
  const [divEng] = await db
    .insert(orgUnits)
    .values({ name: "Engineering", type: "division" })
    .returning();

  const [fnPlatform] = await db
    .insert(orgUnits)
    .values({ name: "Platform", type: "function", parentId: divEng.id })
    .returning();
  
  const [fnProduct] = await db
    .insert(orgUnits)
    .values({ name: "Product Engineering", type: "function", parentId: divEng.id })
    .returning();

  // 3. Roles
  console.log("Creating roles...");
  const roleNames = [
    "Backend Engineer",
    "Frontend Engineer",
    "Fullstack Engineer",
    "Product Manager",
    "Engineering Manager",
    "QA Engineer",
    "Designer",
    "DevOps Engineer",
  ];
  const roleMap = new Map();
  for (const name of roleNames) {
    const [role] = await db.insert(roles).values({ name }).returning();
    roleMap.set(name, role.id);
  }

  // 4. Teams
  console.log("Creating teams...");
  const [teamCore] = await db
    .insert(teams)
    .values({ name: "Core Platform", orgUnitId: fnPlatform.id })
    .returning();
  
  const [teamCheckout] = await db
    .insert(teams)
    .values({ name: "Checkout", orgUnitId: fnProduct.id })
    .returning();

  const [teamMobile] = await db
    .insert(teams)
    .values({ name: "Mobile App", orgUnitId: fnProduct.id })
    .returning();

  // 5. Employees
  console.log("Creating employees...");
  const employeeData = [
    { name: "Alice Johnson", roleT: "Engineering Manager", teamId: teamCore.id, level: "manager" },
    { name: "Bob Smith", roleT: "Backend Engineer", teamId: teamCore.id, level: "senior_expert" },
    { name: "Charlie Brown", roleT: "DevOps Engineer", teamId: teamCore.id, level: "expert" },
    { name: "Diana Prince", roleT: "Product Manager", teamId: teamCheckout.id, level: "senior_expert" },
    { name: "Evan Wright", roleT: "Fullstack Engineer", teamId: teamCheckout.id, level: "expert" },
    { name: "Fiona Lee", roleT: "Frontend Engineer", teamId: teamCheckout.id, level: "officer" },
    { name: "George King", roleT: "Fullstack Engineer", teamId: teamMobile.id, level: "senior_expert" },
    { name: "Hannah Scott", roleT: "Designer", teamId: teamMobile.id, level: "expert" },
  ];

  const employeesMap = [];
  for (const emp of employeeData) {
    const [inserted] = await db
      .insert(employees)
      .values({
        name: emp.name,
        email: `${emp.name.toLowerCase().replace(" ", ".")}@example.com`,
        roleId: roleMap.get(emp.roleT),
        teamId: emp.teamId,
        level: emp.level as any,
        activeFrom: "2025-01-01",
      })
      .returning();
    employeesMap.push(inserted);
  }

  // 6. Projects
  console.log("Creating projects...");
  const [p1] = await db
    .insert(projects)
    .values({
      name: "Cloud Migration",
      priority: 1,
      plannedStart: "2026-02-01",
      plannedEnd: "2026-08-31",
      status: "active",
      portfolioGroup: "Infrastructure",
    })
    .returning();

  const [p2] = await db
    .insert(projects)
    .values({
      name: "New Checkout Flow",
      priority: 2,
      plannedStart: "2026-03-01",
      plannedEnd: "2026-06-30",
      status: "planned",
      portfolioGroup: "Growth",
    })
    .returning();
    
    const [p3] = await db
    .insert(projects)
    .values({
      name: "Mobile App Redesign",
      priority: 3,
      plannedStart: "2026-04-01",
      plannedEnd: "2026-09-30",
      status: "planned",
      portfolioGroup: "Growth",
    })
    .returning();

  // 7. Allocations
  console.log("Creating allocations...");
  // Cloud Migration Needs Backend and DevOps
  const beRoleId = roleMap.get("Backend Engineer");
  const devopsRoleId = roleMap.get("DevOps Engineer");
  
  await db.insert(projectRoleAllocations).values([
    { projectId: p1.id, roleId: beRoleId, monthDate: "2026-02-01", requiredFte: "1.0" },
    { projectId: p1.id, roleId: beRoleId, monthDate: "2026-03-01", requiredFte: "1.5" },
    { projectId: p1.id, roleId: beRoleId, monthDate: "2026-04-01", requiredFte: "2.0" },
    { projectId: p1.id, roleId: devopsRoleId, monthDate: "2026-02-01", requiredFte: "0.5" },
    { projectId: p1.id, roleId: devopsRoleId, monthDate: "2026-03-01", requiredFte: "1.0" },
  ]);
  
  // New Checkout needs Frontend and Fullstack
  const feRoleId = roleMap.get("Frontend Engineer");
  const fsRoleId = roleMap.get("Fullstack Engineer");

   await db.insert(projectRoleAllocations).values([
    { projectId: p2.id, roleId: feRoleId, monthDate: "2026-03-01", requiredFte: "1.0" },
    { projectId: p2.id, roleId: feRoleId, monthDate: "2026-04-01", requiredFte: "1.0" },
    { projectId: p2.id, roleId: fsRoleId, monthDate: "2026-03-01", requiredFte: "1.0" },
  ]);

  // 8. Scenarios
  console.log("Creating scenarios...");
  await db.insert(scenarios).values({
    name: "Baseline Plan",
    type: "BASELINE",
    description: "Current approved quarterly plan",
  });

  await db.insert(scenarios).values({
    name: "Aggressive Growth",
    type: "WHAT_IF",
    description: "Hiring 2 more engineers and accelerating Mobile App",
  });

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
