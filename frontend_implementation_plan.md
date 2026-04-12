# Frontend Modernization & Security Plan

This plan focuses exclusively on improving the ITI EMS Frontend (`Evento-Frontend`). The goal is to harden security, fix critical architectural flaws, and improve the user experience through standardization.

## User Review Required

> [!IMPORTANT]
> **Automatic Session Extension**: Currently, users are logged out every 15 minutes because the frontend does not automatically refresh tokens. I will implement a silent refresh interceptor.
>
> **UI Library Extraction**: I propose moving all duplicated UI logic (Modals, Buttons, Tables) into a centralized `src/components/ui` folder. This will change how future screens are built but will significantly reduce code duplication.
>
> **Environment Variables**: I will move all `localhost:3000` references to a central `.env` configuration.

## Proposed Changes

### 1. Security & Authentication Layer

#### [MODIFY] [api-client.ts](file:///d:/Projects/iti/Evento-Frontend/src/lib/api-client.ts)
- Implement a response interceptor to detect `401 Unauthorized` errors.
- On 401, pause pending requests, attempt to call `/auth/refresh`, and retry the original request on success.
- Replace the hardcoded `baseURL` with `process.env.NEXT_PUBLIC_API_URL`.

#### [MODIFY] [auth.store.ts](file:///d:/Projects/iti/Evento-Frontend/src/store/auth.store.ts)
- Improve the `refreshSession` logic to handle concurrent app initializations.
- (Recommended) Transition from `sessionStorage` for tokens to a more secure storage mechanism or at least unify the state access.

---

### 2. Role-Based Access Control (RBAC) Sync

#### [NEW] [Can.tsx](file:///d:/Projects/iti/Evento-Frontend/src/components/auth/Can.tsx)
- Create a permission-guard component that hides/disables UI elements based on the user's fetched permissions from the backend.
- Prevents "Dead Links": Ensure students don't see "Admin Dashboard" and Company Reps don't see "Admin Settings."

#### [MODIFY] [App Layout](file:///d:/Projects/iti/Evento-Frontend/src/app/layout.tsx)
- On app load, fetch the `Action/Subject` permission set from the backend.
- Store this in the `auth.store` and use it to drive all conditional rendering.

---

### 3. Architectural Standardization

#### [NEW] [UI Core Components](file:///d:/Projects/iti/Evento-Frontend/src/components/ui)
Create a set of "Premium" base components to be used across the app:
- `DataTable.tsx`: Unified table with pagination and sorting logic.
- `Modal.tsx`: Standardized glassmorphic overlay.
- `AppButton.tsx`: Centralized styles for primary, secondary, and ghost buttons.
- `DashboardCard.tsx`: Reusable container for dashboard statistics.

#### [REFAC] [Pages](file:///d:/Projects/iti/Evento-Frontend/src/app)
- Update `StudentCvsPage`, `UsersPage`, etc., to use the new UI components.
- Fix logic where search/filter only applies to the current page in-memory.

---

### 3. Logic & UX Fixes

#### [MODIFY] [Filters & Search]
- Align frontend search logic with backend Query Parameters (`?search=...&page=...`).
- Implement "Debounced Search" to reduce API hammering.

#### [MODIFY] [Error Handling]
- Implement a global "Toast Registry" that handles API error messages automatically via the Axios interceptor.

## Open Questions

> [!IMPORTANT]
> 1. **Theme Consistency**: Should we stick to the current "Light Mode/Glassmorphic" aesthetic, or should I prepare for a Dark Mode switch?
> 2. **Library Preference**: Do you have a preference for any specific UI library for the "Standard UI" (e.g., Radix UI, Headless UI), or should I continue with purely custom Vanilla Tailwind 4 components?

## Verification Plan

### Automated Tests
- **Auth Retention**: Verify the user stays logged in after the 15-minute access token limit passes.
- **Search Accuracy**: Verify that "Student X" can be found even if they are on page 5 of the results.
- **Responsive Audit**: Use the browser tool to verify UI consistency across Mobile and Desktop.

### Manual Verification
- Verify that a single change to `AppButton.tsx` reflects across the entire dashboard.
- Test the "Silent Refresh" during a long data-entry session to ensure no data loss.
