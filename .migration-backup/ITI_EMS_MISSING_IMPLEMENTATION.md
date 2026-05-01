# ITI EMS Implementation Plan

## Current Project Analysis

The backend is partially built, but the foundation is still incomplete. The project has a solid start on the main domain modules, yet several critical platform pieces are missing and a few existing services are still stubbed.

### Implemented Well Enough
- Core Nest app bootstrap is in place.
- Users, students, companies, tracks, events, job-fair, interviews, and student-CV modules exist.
- TypeORM is wired, and the codebase already contains entities, DTOs, controllers, and services for most domains.
- Swagger and validation are enabled at the application level.

### Partially Implemented
- Student CV management exists structurally, but the service is still a placeholder.
- The root job-fair service is still a placeholder even though its sub-features exist.
- Events, companies, and interview flows work at a basic level, but they still need better workflow coverage and safety controls.

### Missing Completely
- Authentication and authorization.
- Feedback module.
- Attendance module.
- Shared common module for guards, filters, interceptors, and reusable utilities.
- Dedicated config and database modules.

### Main Technical Risks
- No route protection, so the API is currently exposed without authentication.
- Hard deletes are still used in important places.
- No audit logging exists for sensitive changes.
- File upload support is not implemented yet, which blocks proper CV handling.

This is the recommended build order for the remaining work in the backend. The sequence is arranged to reduce rework and to make later modules depend on finished foundations instead of temporary stubs.

## Where To Start

Start with Phase 1 and do it in this order:

1. Authentication and Authorization.
2. Common Shared Module.
3. Config and Database Modules.

After that, move to Phase 2, then Phase 3, then Phase 4, and finish with Phase 5.

If you want the shortest path to a secure and usable system, do not start with feature modules before authentication is in place.

## Phase 1. Platform Foundation

### 1. Authentication and Authorization
Goal: protect every domain module before expanding functionality.

Implement:
- `auth` module with login, logout, refresh-token, and registration flows.
- JWT strategy and token validation.
- Role-based guards for admin, staff, student, security, and company rep access.
- Route protection for all existing controllers.

Depends on:
- User entity and role enum.
- Config module for JWT secret and expiration values.

Deliverables:
- Auth endpoints.
- Guarded routes.
- Consistent current-user access pattern.

Start here because every other module depends on it.

### 2. Common Shared Module
Goal: centralize reusable infrastructure used by all modules.

Implement:
- Shared module for guards, decorators, interceptors, filters, and pipes.
- Global exception filter.
- Request logging interceptor.
- Reusable validation and role utilities.

Deliverables:
- `common` module registered in the root app.
- Reusable request/response behavior across the API.

Build this right after auth so guards, filters, and decorators are shared consistently.

### 3. Config and Database Modules
Goal: move environment and datasource setup into dedicated Nest modules.

Implement:
- Config module with typed env access.
- Database module wrapping TypeORM setup.
- Validation for required environment variables.

Deliverables:
- Centralized app configuration.
- Cleaner bootstrap and startup behavior.

Do this before expanding the business modules so the environment and TypeORM setup are stable.

## Phase 2. Core Data Safety

### 4. Soft Deletes
Goal: avoid accidental data loss in business-critical tables.

Implement:
- `deleted_at` on users, events, and companies at minimum.
- Repository/service logic that uses soft-delete semantics.
- Restore flow where needed.

Deliverables:
- Safer delete behavior.
- Recovery path for removed records.

Add this before finishing the rest of the business workflows so deletes are safe from the start.

### 5. Audit Logging
Goal: track sensitive changes for accountability.

Implement:
- Audit log entity or table.
- Write audit entries for approval actions, interview result changes, deletes, and admin updates.
- Record actor, entity type, entity id, action, and timestamp.

Deliverables:
- Persistent history of sensitive operations.
- Data for admin review and incident tracing.

Implement this before interview results, approvals, and other sensitive actions are expanded.

## Phase 3. Core Business Modules

### 6. Student CV Management
Goal: turn the current stub into a working CV management workflow.

Implement:
- Database-backed CRUD service.
- File upload support for CV documents.
- Primary CV selection.
- CV metadata fields such as title and storage URL.
- Student ownership checks.

Depends on:
- File upload infrastructure.
- Auth and role protection.

Deliverables:
- Upload, list, update, and remove CVs.
- Mark one CV as primary.

Relevant file: [src/student-cvs/student-cvs.service.ts](src/student-cvs/student-cvs.service.ts)

Recommended start point for feature work after the foundation is done.

### 7. Event Workflow
Goal: complete event lifecycle management.

Implement:
- Full event CRUD with soft delete support.
- Event type and status filtering.
- Multi-step creation flow for event basics, venues, and agendas.
- Validation for date ranges and agenda ordering.

Depends on:
- Soft deletes.
- Shared validation utilities.

Deliverables:
- More complete event administration flow.
- Event setup that matches the planned UI.

Relevant file: [src/events/events.service.ts](src/events/events.service.ts)

This should follow CVs because job fair and interview flows depend on events.

### 8. Job Fair Module
Goal: connect the job-fair-specific workflows end to end.

Implement:
- Replace the root stub service logic.
- Ensure job profiles, invitations, and branding speakers work as one workflow.
- Add approval and status transitions where needed.
- Tighten event and company relations.

Depends on:
- Auth and role protection.
- Event workflow.

Deliverables:
- Usable job fair administration flow.
- Working invitation and job-profile lifecycle.

Relevant file: [src/job-fair/job-fair.service.ts](src/job-fair/job-fair.service.ts)

Do this after events because the job fair flow is tied to event setup and company handling.

### 9. Interview Workflow
Goal: finish the queue and interview process as a production workflow.

Implement:
- Queue operations for create, move, skip, halt, resume, and complete.
- Interview result tracking.
- Better queue state transitions.
- Audit logging for interview outcome changes.

Depends on:
- Audit logging.
- Auth and role protection.

Deliverables:
- Stable queue management.
- Interview records with results and notes.

Implement this after job fair so queueing and interviews have the correct upstream data.

## Phase 4. Supporting Modules

### 10. Feedback Module
Goal: add a single feedback system for all target types.

Implement:
- Polymorphic feedback entity.
- Submission and retrieval endpoints.
- Support for event, company, and student feedback targets.

Depends on:
- Auth.
- Core entity relationships.

Deliverables:
- One feedback model instead of separate tables.
- Reusable submission logic.

This can come after the core workflows because it depends on users and target entities already existing.

### 11. Attendance Module
Goal: track student attendance at events.

Implement:
- Event attendance entity.
- Check-in endpoint and retrieval flow.
- Duplicate check-in protection.

Depends on:
- Auth.
- Event and student modules.

Deliverables:
- Reliable check-in tracking.

This should be implemented after event management so attendance is tied to real event records.

## Phase 5. Cleanup and Hardening

### 12. File Upload Infrastructure
Goal: support CV and future document/media uploads cleanly.

Implement:
- Upload module and storage integration.
- File validation and size limits.
- Reusable upload service for other modules.

If you want to keep the CV work moving, you can start this in parallel with the Student CV module.

### 13. API Consistency and Admin Utilities
Goal: finish the small pieces that improve the admin experience.

Implement:
- Standard filtering and pagination where missing.
- Consistent error responses.
- Extra admin workflows for approvals and moderation.

Use this as the final pass after the core workflows are stable.

## Final Implementation Order

1. Phase 1: Authentication, shared module, config, and database.
2. Phase 2: Soft deletes and audit logging.
3. Phase 3: Student CVs, events, job fair, and interviews.
4. Phase 4: Feedback and attendance.
5. Phase 5: File uploads and API cleanup.

## Best Starting Files

- [src/app.module.ts](src/app.module.ts)
- [src/main.ts](src/main.ts)
- [src/student-cvs/student-cvs.service.ts](src/student-cvs/student-cvs.service.ts)
- [src/job-fair/job-fair.service.ts](src/job-fair/job-fair.service.ts)
- [src/events/events.service.ts](src/events/events.service.ts)
- [src/users/controllers/companies.controller.ts](src/users/controllers/companies.controller.ts)
