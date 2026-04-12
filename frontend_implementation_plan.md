# Frontend Security, Architecture, and UX Remediation Plan (Reviewed)

This plan is updated after reviewing the actual frontend codebase and current behavior.

## Verified Findings (Code Review)

### Critical

1. Session is forcibly terminated on any 401; no silent refresh or request replay.
	- Evidence: [src/lib/api-client.ts](src/lib/api-client.ts#L47), [src/lib/api-client.ts](src/lib/api-client.ts#L50), [src/lib/api-client.ts](src/lib/api-client.ts#L52)
	- Impact: Users are logged out mid-session after access token expiry.
	- Fix: Add refresh queue + retry interceptor and prevent parallel refresh storms.

2. Route protection middleware is effectively disabled.
	- Evidence: [src/middleware.ts](src/middleware.ts#L13), [src/middleware.ts](src/middleware.ts#L16)
	- Impact: No server-side guard decisions; protection depends entirely on client behavior.
	- Fix: Use cookie-based session hints for middleware checks or keep middleware minimal and enforce route-level server redirects where possible.

### High

3. Hardcoded backend host remains in production code paths.
	- Evidence: [src/lib/api-client.ts](src/lib/api-client.ts#L4), [src/app/(dashboard)/student-cvs/page.tsx](src/app/(dashboard)/student-cvs/page.tsx#L194)
	- Impact: Environment drift, broken environments, mixed-origin file links.
	- Fix: Centralize URL resolution from environment and remove hardcoded absolute localhost links.

4. Search is page-local in many dashboard screens (filtering in-memory only).
	- Evidence:
	  - [src/app/(dashboard)/interviews/page.tsx](src/app/(dashboard)/interviews/page.tsx#L47), [src/app/(dashboard)/interviews/page.tsx](src/app/(dashboard)/interviews/page.tsx#L90)
	  - [src/app/(dashboard)/feedback/page.tsx](src/app/(dashboard)/feedback/page.tsx#L42), [src/app/(dashboard)/feedback/page.tsx](src/app/(dashboard)/feedback/page.tsx#L81)
	  - [src/app/(dashboard)/student-cvs/page.tsx](src/app/(dashboard)/student-cvs/page.tsx#L43), [src/app/(dashboard)/student-cvs/page.tsx](src/app/(dashboard)/student-cvs/page.tsx#L100)
	  - [src/app/(dashboard)/events/page.tsx](src/app/(dashboard)/events/page.tsx#L51), [src/app/(dashboard)/events/page.tsx](src/app/(dashboard)/events/page.tsx#L137)
	  - [src/app/(dashboard)/tracks/page.tsx](src/app/(dashboard)/tracks/page.tsx#L44), [src/app/(dashboard)/tracks/page.tsx](src/app/(dashboard)/tracks/page.tsx#L120)
	  - [src/app/(dashboard)/job-profiles/page.tsx](src/app/(dashboard)/job-profiles/page.tsx#L60), [src/app/(dashboard)/job-profiles/page.tsx](src/app/(dashboard)/job-profiles/page.tsx#L166)
	  - [src/app/(dashboard)/attendance/page.tsx](src/app/(dashboard)/attendance/page.tsx#L53), [src/app/(dashboard)/attendance/page.tsx](src/app/(dashboard)/attendance/page.tsx#L141)
	- Impact: Users cannot reliably find records across full dataset.
	- Fix: Move search to API query params and debounce input.

5. RBAC UI is not implemented; nav is static for all roles.
	- Evidence: [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx#L49), [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx#L60), [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx#L176)
	- Impact: Dead links and confusing UX for restricted roles.
	- Fix: Add role/permission-aware nav filtering and component-level guard.

### Medium

6. Auth initialization runs from two places, which can trigger duplicated refresh calls.
	- Evidence: [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx#L22), [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx#L20)
	- Impact: Extra auth traffic and race conditions on boot.
	- Fix: Single bootstrap owner for initialize flow.

7. Redirect side effect is executed during render in AuthGuard.
	- Evidence: [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx#L48)
	- Impact: Potential render-loop warnings and unstable navigation behavior.
	- Fix: Move redirect into useEffect based on auth state.

8. Unreachable/contradictory guard branch in AuthGuard.
	- Evidence: [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx#L24), [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx#L36)
	- Impact: Dead code and unclear auth flow.
	- Fix: Simplify state machine for loading/unauthenticated/authenticated states.

9. refreshSession exists but is not used anywhere.
	- Evidence: [src/store/auth.store.ts](src/store/auth.store.ts#L21), [src/store/auth.store.ts](src/store/auth.store.ts#L209)
	- Impact: Session extension logic is effectively inactive.
	- Fix: Integrate refreshSession into interceptor flow or remove and replace with unified refresh manager.

10. Global auth:logout listener is attached at module scope.
	- Evidence: [src/store/auth.store.ts](src/store/auth.store.ts#L284)
	- Impact: Possible duplicate listeners in dev/HMR and harder lifecycle control.
	- Fix: Register/unregister listener inside a React provider/hook.

## What Already Looks Good

1. Users and companies pages already use debounced server-side search.
	- Evidence: [src/app/(dashboard)/users/page.tsx](src/app/(dashboard)/users/page.tsx#L75), [src/app/(dashboard)/companies/page.tsx](src/app/(dashboard)/companies/page.tsx#L74)

2. A shared toast store and container already exist.
	- Evidence: [src/store/toast.store.ts](src/store/toast.store.ts), [src/components/ToastContainer.tsx](src/components/ToastContainer.tsx)

3. Shared UI primitives already started (do incremental extension, not full rewrite).
	- Evidence: [src/components/ui/ConfirmDialog.tsx](src/components/ui/ConfirmDialog.tsx), [src/components/ui/SearchableSelect.tsx](src/components/ui/SearchableSelect.tsx)

## Updated Remediation Plan

### Phase 0 - Session and Access Hardening (Blocker)

1. Build robust token refresh in API client.
	- Files:
	  - [src/lib/api-client.ts](src/lib/api-client.ts)
	  - [src/store/auth.store.ts](src/store/auth.store.ts)
	- Changes:
	  - Add one-at-a-time refresh promise queue.
	  - Retry failed requests after refresh.
	  - Logout only when refresh fails.

2. Remove hardcoded backend URLs.
	- Files:
	  - [src/lib/api-client.ts](src/lib/api-client.ts)
	  - [src/app/(dashboard)/student-cvs/page.tsx](src/app/(dashboard)/student-cvs/page.tsx)
	- Changes:
	  - Standardize on one env key: NEXT_PUBLIC_API_BASE_URL.
	  - Build file URLs from configured origin.

3. Harden route protection strategy.
	- Files:
	  - [src/middleware.ts](src/middleware.ts)
	  - [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx)
	- Changes:
	  - Make middleware behavior explicit (cookie-aware checks if feasible).
	  - Move redirects to effect-based transitions in AuthGuard.

### Phase 1 - Search and Data UX Correctness

1. Replace in-memory page-local filtering with API-driven search.
	- Files:
	  - [src/app/(dashboard)/interviews/page.tsx](src/app/(dashboard)/interviews/page.tsx)
	  - [src/app/(dashboard)/feedback/page.tsx](src/app/(dashboard)/feedback/page.tsx)
	  - [src/app/(dashboard)/student-cvs/page.tsx](src/app/(dashboard)/student-cvs/page.tsx)
	  - [src/app/(dashboard)/events/page.tsx](src/app/(dashboard)/events/page.tsx)
	  - [src/app/(dashboard)/tracks/page.tsx](src/app/(dashboard)/tracks/page.tsx)
	  - [src/app/(dashboard)/job-profiles/page.tsx](src/app/(dashboard)/job-profiles/page.tsx)
	  - [src/app/(dashboard)/attendance/page.tsx](src/app/(dashboard)/attendance/page.tsx)
	- Changes:
	  - Debounced query state tied to API requests.
	  - Reset page to 1 on search change.
	  - Remove local filter over current page items.

2. Expand service APIs to accept optional search where backend supports it.
	- Files:
	  - [src/services/interviews.service.ts](src/services/interviews.service.ts)
	  - [src/services/feedback.service.ts](src/services/feedback.service.ts)
	  - [src/services/student-cvs.service.ts](src/services/student-cvs.service.ts)
	  - [src/services/tracks.service.ts](src/services/tracks.service.ts)
	  - [src/services/job-profiles.service.ts](src/services/job-profiles.service.ts)
	- Note: Some endpoints may require backend support before frontend can fully switch.

### Phase 2 - RBAC and Navigation Consistency

1. Add role-aware navigation and component guard.
	- Files:
	  - [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx)
	  - [src/components/auth/Can.tsx](src/components/auth/Can.tsx)
	  - [src/store/auth.store.ts](src/store/auth.store.ts)
	- Changes:
	  - Start with role-based rules from user.role.
	  - Upgrade to permission matrix when backend exposes a permissions endpoint.

2. Remove duplicate auth bootstrapping.
	- Files:
	  - [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx)
	  - [src/components/AuthGuard.tsx](src/components/AuthGuard.tsx)
	- Changes:
	  - Single source of truth for initialize().

### Phase 3 - UI Standardization (Incremental)

1. Continue extracting reusable UI primitives, but avoid big-bang migration.
	- Existing base:
	  - [src/components/ui/ConfirmDialog.tsx](src/components/ui/ConfirmDialog.tsx)
	  - [src/components/ui/SearchableSelect.tsx](src/components/ui/SearchableSelect.tsx)
	- Next candidates:
	  - Data table shell
	  - Action button variants
	  - Dashboard stat card wrapper

2. Keep visual language consistent with current design unless product requests theme shift.

## Open Product Decisions

1. Should middleware enforce auth using HTTP-only cookie strategy, or remain client-guard-only for now?
2. Is role-based UI filtering enough initially, or do you want full permission-based UI once backend exposes permissions?
3. Should we keep current light glass style as default and postpone dark mode?

## Verification Plan

### Automated

1. Auth retention test:
	- Access token expiration should not force logout when refresh token is valid.

2. Search correctness test:
	- Searching for records outside current page must return results.

3. URL config test:
	- No hardcoded localhost references in source files.

4. Guard flow test:
	- Unauthorized users are redirected without render-side navigation warnings.

### Manual

1. Start a long session and confirm no logout interruptions during normal API use.
2. Validate nav items by role (student/company_rep/admin) to avoid dead links.
3. Confirm CV download links use configured backend origin and work across environments.
