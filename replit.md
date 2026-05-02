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
- **Stack**: React, Vite, Wouter (routing), Zustand (state), Axios (API client), Tailwind v4, Socket.IO client
- **Purpose**: Multi-role Employment Management System for ITI (students, staff, admins, companies, security)
- **Features**: Auth, dashboards per role, companies, tracks, events, job profiles, interviews, attendance, feedback, user management, live interview queue console
- **API**: Calls external backend via `VITE_API_BASE_URL` env var (defaults to `/api` via Vite proxy → localhost:8080)
- **Fonts**: Inter (Google Fonts) + Material Symbols Outlined (Google Fonts)
- **Entry**: `src/main.tsx` → `src/App.tsx` (wouter-based routing)
- **Theme**: Custom CSS variables in `src/app/globals.css` (ITI red primary `#C1272D`)

### Source Structure (post-restructure)

```
src/
├── app/                    # Thin route shells only
│   ├── (auth)/             # login, register
│   ├── (dashboard)/        # all role dashboards + CRUD pages
│   ├── job-fair/           # public token-gated check-in
│   └── live/[jobProfileId] # NEW: Interviewer Console route
│
├── features/               # Domain modules — each owns api/model/hooks/components
│   ├── auth/               # auth.store, AuthGuard, RoleGuard, auth.api, auth.schema
│   ├── users/              # users.api, user.schema, user.types, UserForm, UserDetails
│   ├── companies/          # companies.api, company.schema, CompanyForm, CompanyDetails
│   ├── tracks/             # tracks.api, track.schema, TrackForm, TrackDetails
│   ├── events/             # events.api, event.types
│   ├── job-profiles/       # job-profiles.api, job-profile.types
│   ├── invitations/        # invitations.api, invitation.types
│   ├── attendance/         # attendance.api, attendance.types
│   ├── feedback/           # feedback.api, feedback.types
│   ├── branding/           # branding.api (branding-speakers), branding.types
│   ├── students/           # student.types
│   ├── student-cvs/        # student-cvs.api, student-cv.types
│   ├── interviews/         # interviews.api, interview.types, InterviewerConsole
│   ├── dashboard/          # dashboard.api
│   └── live-queue/         # NEW — full WS live queue implementation
│       ├── api/queues.api.ts
│       ├── model/queue.types.ts
│       ├── store/queue.store.ts   # per-jobProfile Zustand factory
│       ├── hooks/useQueueLive.ts  # WS + fallback poll + reconcile
│       │    useInterviewSession.ts # optimistic actions
│       │    useTabLeader.ts       # Web Locks API leader election
│       ├── lib/reconcile.ts | broadcast.ts | optimistic.ts
│       └── components/QueueList, QueueRow, ActivePanel, SyncBadge, FallbackBanner
│
└── shared/                 # Cross-cutting infra
    ├── api/api-client.ts   # Axios + refresh-token queue + 401 dedup + BroadcastChannel
    ├── ws/ws-client.ts     # Socket.IO singleton, reconnect, rooms, heartbeat
    ├── auth/permissions.ts # Re-exports from RoleGuard
    ├── lib/utils.ts | file-validation.ts | env.ts
    ├── store/toast.store.ts
    ├── hooks/useDebounce.ts | usePagination.ts
    ├── types/enums.ts      # All enums (UserRole, QueueStatus, EventType, etc.)
    │        api.ts         # ApiResponse<T>, PaginatedResponse<T>
    └── ui/index.ts         # Re-exports all shared UI components
```

### Key Behaviors
- **Auth**: JWT in memory (access token) + sessionStorage (refresh token). Refresh-token queue: concurrent 401s queue behind a single in-flight refresh promise; BroadcastChannel('auth') syncs new token to other tabs.
- **Live Queue** (`/live/:jobProfileId`): Socket.IO rooms per job profile; optimistic UI with rollback table; fallback polling if WS unreachable in 5s or 3 disconnects/60s; Web Locks leader election (only leader tab issues mutations); snapshot reconciliation on reconnect. Hotkeys S/E/K/N.
- **Role permissions**: Single source of truth in `src/components/RoleGuard.tsx` (`PERMISSIONS`, `ROLE_PERMISSIONS`); re-exported from `shared/auth/permissions.ts`.
- **Vite proxy**: `/api` → `http://localhost:8080` (api-server) during dev.
