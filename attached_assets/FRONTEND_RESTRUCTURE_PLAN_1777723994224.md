# ITI EMS Frontend — Feature-Modular Restructure Plan

## 1. Why

The app currently has a flat structure: every axios call lives in `src/services/`, every type in `src/types/index.ts`, every zod schema in `src/validations/`, and route components in `src/app/(dashboard)/<entity>/page.tsx` mix data fetching, modal state, and rendering. The CRUD pattern is duplicated by hand across users / companies / tracks.

Two structural problems block scale:

1. **Cross-cutting drift.** The role/permission matrix is duplicated between `src/middleware.ts` (server) and `src/components/RoleGuard.tsx` (client). `auth.store.initialize()` is invoked from both `layout.tsx` and `AuthGuard.tsx`. There is no refresh-token queue — any 401 logs the user out. `student-cvs/page.tsx` hardcodes `localhost:3000`.
2. **No production live-queue layer.** The backend already exposes a Socket.IO gateway on port 3001 (`queueJoined`, `queueUpdated`, `interviewStarted`, `interviewEnded`), but the frontend has zero WS code. With 1000+ students and 50+ companies on a single Job Fair day, polling REST will not hold up. The interviewer console — the most business-critical surface — does not exist.

Stack stays as-is: Next 16, React 19.2, Tailwind v4, axios, Zustand, react-hook-form + zod. **No** TanStack Query, **no** Redux.

---

## 2. Target Folder Structure

```
src/
├── app/                              # Routes only — thin shells, import from features
│   ├── (auth)/login | register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/        | companies/       | tracks/
│   │   ├── job-profiles/ | events/          | feedback/
│   │   ├── students/     | student-cvs/     | attendance/
│   │   ├── interviews/   | profile/
│   │   └── *-dashboard/                     # role landing pages
│   ├── job-fair/                     # public token-gated check-in flow
│   │   ├── page.tsx
│   │   └── [token]/page.tsx
│   ├── live/                         # NEW — interviewer console
│   │   └── [jobProfileId]/page.tsx
│   ├── layout.tsx
│   └── middleware.ts                 # imports permission map from shared/auth
│
├── features/                         # Domain modules — each owns api/model/hooks/components
│   ├── auth/             api | model | hooks | components | store
│   ├── users/            api | model | hooks | components
│   ├── companies/        api | model | hooks | components
│   ├── tracks/           api | model | hooks | components
│   ├── students/         api | model | hooks | components
│   ├── student-cvs/      api | model | hooks | components | lib
│   ├── events/           api | model | hooks | components
│   ├── job-profiles/     api | model | hooks | components
│   ├── invitations/      api | model | hooks | components
│   ├── attendance/       api | model | hooks | components
│   ├── feedback/         api | model | hooks | components
│   ├── branding/         api | model | hooks | components
│   ├── dashboard/        api | model | hooks | components
│   ├── interviews/       api | model | hooks | components
│   │   └── components/InterviewerConsole, ResultModal, RescheduleModal
│   └── live-queue/                   # NEW — heart of Job Fair
│       ├── api/queues.api.ts
│       ├── model/queue.types.ts | queue.schema.ts | events.types.ts
│       ├── store/queue.store.ts      # per-jobProfile factory, normalized
│       ├── hooks/useQueueLive.ts | useInterviewSession.ts | useTabLeader.ts
│       ├── lib/reconcile.ts | optimistic.ts | broadcast.ts
│       └── components/QueueList, QueueRow, ActivePanel, SyncBadge, FallbackBanner
│
└── shared/                           # Cross-cutting infra
    ├── api/api-client.ts             # axios + refresh queue + 401 dedup
    ├── ws/ws-client.ts               # Socket.IO singleton, reconnect, rooms
    ├── auth/permissions.ts           # SINGLE source of truth (replaces dup map)
    ├── auth/middleware-helpers.ts
    ├── store/toast.store.ts
    ├── ui/                           # Modal, ConfirmDialog, SearchableSelect, Button, Table, Badge, …
    ├── hooks/                        # useDebounce, usePagination, useEventListener, useBroadcastChannel
    ├── lib/                          # file-validation, env, format, utils
    └── types/api.ts                  # ApiResponse<T>, Paginated<T>, ErrorEnvelope
```

### Import rules

- Each `features/<f>/index.ts` re-exports its public surface.
- Routes import only from `@/features/*` and `@/shared/*` — never cross-feature deep paths.
- Features may depend on `@/shared/*` but never on each other directly. If feature A needs feature B's data, it goes through B's barrel.
- The `@/*` alias in `tsconfig.json` already covers the new paths — no config change required.

---

## 3. File-Move Table (major files)

| Current | New |
|---|---|
| `src/services/auth.service.ts` | `src/features/auth/api/auth.api.ts` |
| `src/services/users.service.ts` | `src/features/users/api/users.api.ts` |
| `src/services/companies.service.ts` | `src/features/companies/api/companies.api.ts` |
| `src/services/tracks.service.ts` | `src/features/tracks/api/tracks.api.ts` |
| `src/services/job-profiles.service.ts` | `src/features/job-profiles/api/job-profiles.api.ts` |
| `src/services/events.service.ts` | `src/features/events/api/events.api.ts` |
| `src/services/invitations.service.ts` | `src/features/invitations/api/invitations.api.ts` |
| `src/services/attendance.service.ts` | `src/features/attendance/api/attendance.api.ts` |
| `src/services/feedback.service.ts` | `src/features/feedback/api/feedback.api.ts` |
| `src/services/branding-speakers.service.ts` | `src/features/branding/api/branding.api.ts` |
| `src/services/student-cvs.service.ts` | `src/features/student-cvs/api/student-cvs.api.ts` (drop hardcoded `localhost`; use `shared/lib/env.ts`) |
| `src/services/interviews.service.ts` | `src/features/interviews/api/interviews.api.ts` |
| `src/services/queues.service.ts` | `src/features/live-queue/api/queues.api.ts` |
| `src/services/dashboard.service.ts` | `src/features/dashboard/api/dashboard.api.ts` |
| `src/lib/api-client.ts` | `src/shared/api/api-client.ts` (+ refresh queue) |
| `src/lib/file-validation.ts` | `src/shared/lib/file-validation.ts` |
| `src/lib/utils.ts` | `src/shared/lib/utils.ts` |
| `src/store/auth.store.ts` | `src/features/auth/store/auth.store.ts` |
| `src/store/toast.store.ts` | `src/shared/store/toast.store.ts` |
| `src/components/AuthGuard.tsx` | `src/features/auth/components/AuthGuard.tsx` |
| `src/components/RoleGuard.tsx` | `src/features/auth/components/RoleGuard.tsx` (consume `shared/auth/permissions.ts`) |
| `src/components/ToastContainer.tsx` | `src/shared/ui/ToastContainer.tsx` |
| `src/components/ui/*` | `src/shared/ui/*` |
| `src/middleware.ts` | stays at `src/middleware.ts` (Next requirement) but imports `shared/auth/permissions.ts` |
| `src/validations/auth.schema.ts` | `src/features/auth/model/auth.schema.ts` |
| `src/validations/user.schema.ts` | `src/features/users/model/user.schema.ts` |
| `src/validations/company.schema.ts` | `src/features/companies/model/company.schema.ts` |
| `src/validations/track.schema.ts` | `src/features/tracks/model/track.schema.ts` |
| `src/types/index.ts` | **SPLIT** per feature into `features/<f>/model/*.types.ts`. Cross-feature enums (`UserRole`, `QueueStatus`, `EventType`, `EventStatus`, `InterviewType`, `InterviewResult`, `CompanyInvitationStatus`, `CompanyStatus`, `StudentStatus`, `AgendaItemType`, `FeedbackTargetType`) → `shared/types/enums.ts`. `ApiResponse<T>`, `PaginatedResponse<T>` → `shared/types/api.ts`. |
| `src/app/(dashboard)/<entity>/components/*` | `src/features/<entity>/components/*` |
| `src/app/(dashboard)/interviews/page.tsx` | thin route → `features/interviews/components/InterviewsPage.tsx` |

---

## 4. Live-Queue Architecture

### 4.1 WS client (`shared/ws/ws-client.ts`)

- Socket.IO singleton, lazy-connected on first `subscribe`.
- JWT attached via `auth: { token }` on connect.
- Exponential backoff (1s → 30s, jitter), heartbeat ping every 20s.
- `joinRoom('jobProfile:{id}')` / `leaveRoom`.
- Emits typed events to a tiny pub-sub.
- On `connect_error('unauthorized')` → trigger refresh, then reconnect with new token.

### 4.2 Queue store factory (`features/live-queue/store/queue.store.ts`)

`createQueueStore(jobProfileId)` returns a Zustand store with:

- `entriesById: Record<string, QueueEntry>` — normalized
- `order: string[]`
- `activeInterviewId: string | null`
- `pending: Record<actionId, OptimisticAction>` — rollback table, 10s TTL
- `syncState: 'idle' | 'syncing' | 'fallback-poll' | 'live'`
- Selectors via shallow equality so a row only re-renders when its own entry changes.

**Hydration:** REST `GET /queues?jobProfileId=…` snapshot replaces store. Then WS deltas merge in.

**Reconciliation:** on connect and every reconnect, refetch snapshot, diff against store, drop optimistic actions older than snapshot timestamp. Show `<SyncBadge state="syncing" />`.

**Optimistic UI:** action dispatcher returns an `actionId`, immediately mutates store with `pending[actionId]`, calls REST.
- 2xx-with-WS-echo → clear pending.
- 4xx/5xx → rollback + toast.
- WS echo arrives before REST returns → trust WS, mark REST as confirmed.
Every entry carries `_optimistic: boolean` and `_serverVersion: number`; store discards deltas with `version <= local.version`.

### 4.3 Multi-tab safety (`useTabLeader` + BroadcastChannel `queue:{id}`)

Leader election (Web Locks API; lock-name fallback). Only the leader tab issues mutations from global hotkeys; followers render a **"Read-only (other tab is leading)"** banner.

### 4.4 Fallback polling

Connection watchdog. If `connect` doesn't fire within 5s, or 3 disconnects within 60s, switch to `setInterval(3000)` polling on the snapshot endpoint. Resume WS-only mode after 30s of stable connection.

### 4.5 Data flow

```
              ┌────────────┐    REST GET /queues?jobProfileId   ┌─────────────┐
              │ Interviewer│ ─────────────────────────────────▶ │  Backend    │
              │  Console   │ ◀────────── snapshot ────────────  │  (Nest)     │
              └─────┬──────┘                                    └─────┬───────┘
                    │ subscribe(jobProfileId)                         │
                    ▼                                                 │
              ┌────────────┐    socket.io  rooms                      │
              │ ws-client  │ ◀──────── queueJoined / queueUpdated ────┤
              │ singleton  │           interviewStarted / Ended       │
              └─────┬──────┘                                          │
                    │ typed events                                    │
                    ▼                                                 │
              ┌────────────┐  optimistic apply  ┌─────────────────┐   │
   click ───▶ │ queue.store│ ─────────────────▶ │ pending actions │   │
   "Skip"     │ (per JP)   │ ◀── reconcile ──── │  rollback table │   │
              └─────┬──────┘                    └─────────────────┘   │
                    │ POST /queues/:id/skip (Idempotency-Key)         │
                    └─────────────────────────────────────────────────┘
                                │ BroadcastChannel('queue:{id}')
                                ▼
                          other tabs (followers) update view only
```

### 4.6 Interviewer Console

Route `app/live/[jobProfileId]/page.tsx` mounts `<InterviewerConsole jobProfileId=… />` from `features/interviews/components/`.

Two-column layout:
- **Left:** `<QueueList />` (windowed once >100 rows)
- **Right:** `<ActivePanel />` — CV iframe (signed URL), candidate header, action bar.

Actions wire through `useInterviewSession(jobProfileId)`: `start`, `end(result, notes)`, `skip`, `halt`, `resume`, `callNext`, `addBreak`, `requestReschedule`. Hotkeys S / E / K / N, all gated by tab-leader.

---

## 5. Cross-Cutting Fixes (must land before Phase 6)

| Issue | Fix |
|---|---|
| Permission map duplicated in `middleware.ts` and `RoleGuard.tsx` | Single `shared/auth/permissions.ts`, both consume it |
| `auth.store.initialize()` called twice (layout + AuthGuard) | Keep only inside `AuthGuard` |
| No refresh-token queue — any 401 logs out | Single in-flight refresh promise in api-client; queue concurrent 401s; `BroadcastChannel('auth')` so other tabs adopt the new token |
| `student-cvs/page.tsx` hardcodes `http://localhost:3000` | Use `shared/lib/env.ts` (`NEXT_PUBLIC_API_URL`) |
| Soft-delete UX inconsistent | List views default to active rows; detail pages handle 410 with restore action for admin; render `deletedAt` as greyed badge instead of hiding mid-action |

---

## 6. Phased Migration

| Phase | Scope | Risk | Verify |
|---|---|---|---|
| 0 | Scaffold empty `src/features/` and `src/shared/` trees + per-feature `index.ts` barrels. Add path aliases (already covered by `@/*`). | Low | `npm run build` passes; nothing imports from new paths yet. |
| 1 | Shared infra. Move `lib/api-client.ts`, `lib/utils.ts`, `lib/file-validation.ts`, `store/toast.store.ts`, `components/ui/*`, `components/ToastContainer.tsx`. Add `shared/auth/permissions.ts`. Update `middleware.ts` and `RoleGuard.tsx` to consume it. Add refresh-token queue. | Medium | Login / refresh / role-gated nav for every role (admin, staff, student, security, company_rep). |
| 2 | Auth feature. Move `auth.store`, `AuthGuard`, `auth.service`, `auth.schema`. Remove duplicate `initialize()` from layout. | Medium | Hard reload, token expiry, manual logout, register flow. |
| 3 | CRUD features (parallelizable). users → companies → tracks → job-profiles, one feature per PR. Each PR moves api + model + components + route shells; splits its slice out of `types/index.ts`. | Low | Per-PR: lint, typecheck, smoke test list/detail/edit. |
| 4 | Domain features. events, invitations, branding, attendance, feedback, students, student-cvs (fix hardcoded URL), dashboard. | Low | Same smoke pattern; spot-check pagination + filters. |
| 5 | Interviews. Move existing interviews module; introduce `useInterviewSession` skeleton without WS yet. | Medium | Existing modal-based flow unchanged. |
| 6 | **Live-queue feature** (highest payoff). Add `shared/ws/ws-client.ts`, `live-queue` feature, `app/live/[jobProfileId]/page.tsx`, optimistic actions, BroadcastChannel, fallback polling, reconnect reconciliation. Behind `NEXT_PUBLIC_LIVE_QUEUE=1`. | High | Dry-run with 200 fake entries via seeded fixture; kill-network test; two-tab leader-election test; refresh-token-during-live test. |
| 7 | Console UI polish. Hotkeys, CV viewer, reschedule modal, break controls. | Low | End-to-end Job Fair rehearsal with realistic data. |
| 8 | Cleanup. Delete legacy `src/services`, `src/store`, top-level `src/components`, `src/types/index.ts`, `src/validations`. | Low | `tsc --noEmit` and `next build` clean. |

---

## 7. Top Risks & Mitigations

1. **WS auth handshake during token rotation** → attach token via `auth` payload; on `connect_error('unauthorized')` refresh then reconnect; never reconnect with stale token.
2. **Refresh-token race** → single in-flight refresh promise in api-client; queue concurrent 401s; `BroadcastChannel('auth')` so other tabs adopt the new token.
3. **Stale queue subscriptions / memory leak** → store factory keyed by `jobProfileId`; route unmount calls `store.dispose()` which leaves WS room and aborts in-flight requests via `AbortController`.
4. **Optimistic-UI divergence** → server version per entry; reject older deltas; force snapshot refetch on reconnect; pending TTL 10s with auto-rollback toast.
5. **Multi-tab double-act** → Web Locks leader election; only leader issues mutations; followers see read-only state.
6. **Soft-delete UX** → list views default to active rows; detail pages handle 410 with restore action for admin; render `deletedAt` as greyed badge instead of hiding mid-action.
7. **CV viewer CORS** → backend must serve signed URLs with permissive CORS or proxy via Next route handler.
8. **Idempotency key plumbing** → generate UUID per click, retain across retries, never regenerate on auto-retry.

---

## 8. Final Acceptance

- `npm run build` clean, `tsc --noEmit` clean, `npm run lint` clean.
- All 5 roles can log in, see only their permitted nav, perform their flows.
- Token refresh works under 3 concurrent 401s without double-refresh (verify in network tab).
- Live-queue page with `NEXT_PUBLIC_LIVE_QUEUE=1`: 200-entry fixture, kill WiFi for 10s → fallback banner appears → reconnect → snapshot reconciles → no duplicate or lost entries. Two tabs: only one acts on hotkeys; second shows read-only banner.
- Backend handoff doc reviewed by one backend engineer; every "Endpoint to Add" row has DTO + auth role + idempotency answered.
