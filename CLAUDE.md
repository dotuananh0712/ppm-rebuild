# PPM Rebuild - Project & Portfolio Management

> Enterprise capacity planning for tracking projects, allocations, and team resource planning.

## Quick Facts

- **Stack**:
  - Frontend: React 18 + Vite 7 + TypeScript
  - Backend: Express.js 5 + TypeScript
  - Database: PostgreSQL 16 (Drizzle ORM)
  - UI: shadcn/ui + Tailwind CSS + Recharts
  - Routing: Wouter (client), Express (server)
  - State: TanStack React Query
  - Forms: React Hook Form + Zod
  - Validation: Zod (shared between client/server)
- **Dev Command**: `npm run dev` (port 5000)
- **Build Command**: `npm run build` (Vite client + esbuild server)
- **Start Command**: `npm start` (production)
- **Type Check**: `npm run check`
- **DB Push**: `npm run db:push` (apply schema changes)

## Key Directories

- `client/src/pages/` - Page components (Dashboard, Projects, Resources, etc.)
- `client/src/components/ui/` - shadcn/ui components
- `client/src/components/` - Custom components (Sidebar)
- `client/src/hooks/` - React Query hooks
- `client/src/lib/` - Query client config + utilities
- `server/` - Express server (routes, storage, db)
- `shared/` - Shared schema (Drizzle tables + Zod) and API route definitions
- `script/` - Build scripts

## Architecture

- **Monolith structure**: Client + server + shared code in one package
- **Schema-driven development**: Drizzle tables define DB schema, Zod schemas derive validation and types
- **Type-safe API contract**: `shared/routes.ts` defines all endpoints with Zod request/response schemas
- **Data access layer**: `server/storage.ts` implements `IStorage` interface with Drizzle queries
- **Path aliases**: `@/` = `client/src/`, `@shared/` = `shared/`

## Database Schema

Core tables in `shared/schema.ts`:

- **org_unit** - Organizational hierarchy (division → function → subfunction → team)
- **role** - Functional roles (Backend Engineer, PM, etc.)
- **team** - Capacity pools with team lead
- **employee** - Staff with role, level, team, FTE capacity
- **project** - Portfolio items with priority, dates, status
- **project_role_allocation** - Monthly FTE demand by role
- **scenario** - BASELINE and WHAT_IF scenarios
- **scenario_project_override** - Scenario-specific project overrides
- **calendar_month** - Time dimension

## Code Style

- TypeScript strict mode enabled
- Functional React components with hooks only
- PascalCase for React component files, kebab-case for utilities
- camelCase for variables, PascalCase for types
- `cn()` utility for merging Tailwind classes
- Default exports for pages, named exports for reusable components

## Critical Rules

### Error Handling

- NEVER swallow errors silently
- Client: catch in hooks, display via toast or error states
- Server: Zod validation errors return 400, unexpected errors return 500

### UI States

- Always handle: loading, error, empty, success states
- Use Skeleton placeholders during loading
- Every list needs an empty state

### Database

- Use `IStorage` interface for all data access
- Schema changes go in `shared/schema.ts`, then run `npm run db:push`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - development | production

## Common Commands

```bash
# Development
npm run dev          # Start dev server (port 5000)
npm run check        # TypeScript type check
npm run build        # Production build

# Database
npm run db:push      # Apply schema changes to PostgreSQL
```

## Important Notes

- Update this CLAUDE.md if design changes
- All CLAUDE generated documents should be stored in the docs folder
