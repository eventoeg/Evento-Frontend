# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### ITI EMS (`artifacts/iti-ems`)
- **Kind**: React + Vite web app (migrated from Next.js)
- **Preview path**: `/`
- **Port**: 25859
- **Stack**: React, Vite, Wouter (routing), Zustand (state), Axios (API client), Tailwind v4
- **Purpose**: Multi-role Employment Management System for ITI (students, staff, admins, companies, security)
- **Features**: Auth, dashboards per role, companies, tracks, events, job profiles, interviews, attendance, feedback, user management
- **API**: Calls external backend via `VITE_API_BASE_URL` env var (defaults to `http://localhost:3001`)
- **Fonts**: Inter (Google Fonts) + Material Symbols Outlined (Google Fonts)
- **Entry**: `src/main.tsx` → `src/App.tsx` (wouter-based routing)
- **Auth**: `src/components/AuthGuard.tsx` + `src/store/auth.store.ts` (Zustand)
- **Pages**: Located in `src/app/(auth)/` and `src/app/(dashboard)/`
- **Theme**: Custom CSS variables in `src/app/globals.css` (ITI red primary `#C1272D`)
