# ITI EMS API Documentation

This document describes the REST API for the ITI Employment Management System.
It is written for frontend integration, Swagger testing, and AI-assisted consumption of the backend.

The API is built around a consistent response envelope, JWT bearer authentication, paginated list endpoints, and a global error filter so clients can handle success and failure responses in the same shape.

## Base Setup

- Base URL: `http://localhost:3000`
- Swagger UI: `/api`
- Authentication: JWT bearer token
- Swagger auth scheme name: `access-token`

## Request Pipeline

Every request goes through the same core pipeline:

- `ValidationPipe` rejects invalid bodies and query parameters.
- `JwtAuthGuard` protects authenticated routes.
- `PoliciesGuard` applies CASL authorization rules and ownership checks.
- `TransformInterceptor` wraps successful responses in a standard envelope.
- `HttpExceptionFilter` wraps failures in the same envelope structure.
- `LoggingInterceptor` records method, path, status code, duration, and user agent.

## Global Behavior

### Authentication

Most endpoints are protected and require a bearer token.
Use `/auth/login` or `/auth/register` to obtain tokens, then paste the access token into Swagger UI using the Authorize button.

### Response Envelope

Successful responses are wrapped like this:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "path": "/users",
  "data": {
    "items": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 20,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "errors": null,
  "timestamp": "2026-04-11T12:00:00.000Z"
}
```

Failed responses use the same envelope and include the error details:

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["email must be an email"],
  "path": "/auth/register",
  "data": null,
  "pagination": null,
  "errors": ["email must be an email"],
  "timestamp": "2026-04-11T12:00:00.000Z"
}
```

The `message` field may be a string or an array, depending on the source of the error.
The `errors` field is always normalized to an array.

### Pagination

List endpoints use a shared pagination query model:

- `page`: starting at `1`
- `limit`: between `1` and `100`

Paginated responses include metadata:

```json
{
  "items": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Common Error Codes

- `400 Bad Request`: validation errors, duplicate queue joins, invalid upload files, or other rejected input.
- `401 Unauthorized`: missing or invalid JWT.
- `403 Forbidden`: authenticated but not allowed by CASL policy.
- `404 Not Found`: resource does not exist or is not visible to the current user.
- `409 Conflict`: duplicate email or other unique constraint violation.

## Auth APIs

### `POST /auth/login`
Purpose: authenticate an existing user with email and password.

Body fields:

- `email`: the account email.
- `password`: the account password.

Returns:

- `accessToken`: bearer token for protected routes.
- `refreshToken`: token used to renew the session.
- `user`: the profile object the frontend should cache after login.

Important: the password is verified against the stored hash and the password field is never returned.

Request body:

```json
{
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

### `POST /auth/register`
Purpose: create a new account and immediately sign the user in.

Body fields:

- `firstName`, `lastName`
- `email`
- `password`
- `role` optional, defaults to `student`
- `trackId` required for students
- `companyId` required for company reps
- `graduationYear` optional for students

Returns the same token pair and profile payload as login.

Important: validation rules change based on role, so the client should only send `trackId` for students and `companyId` for company representatives.

### `POST /auth/refresh`
Purpose: exchange a refresh token for a new access token pair without prompting the user to log in again.

Body fields:

- `refreshToken`: the previously issued refresh token.

Returns a new `accessToken` and `refreshToken` pair tied to the same user identity.

Request body:

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

### `GET /auth/profile`
Purpose: return the currently authenticated user profile.

Headers:

- `Authorization: Bearer <accessToken>`

Use this route when the frontend needs to bootstrap the current session or refresh the user store.

Requires bearer auth.

## Users APIs

### `POST /users`
Purpose: create a user record directly from the admin side.

Use this when you need to create a user without going through the auth register flow.

The request can link the user to a company or track depending on the role.

### `GET /users`
Purpose: list users in creation order with pagination.

Query parameters:

- `role`: filter the list to one user role.
- `page`: page number, starting from `1`.
- `limit`: page size, up to `100`.

Returns the standard pagination envelope with `items` and `pagination` metadata.

### `GET /users/:id`
Purpose: fetch one user by UUID.

The response can include:

- the linked company for company reps
- the linked student profile for students
- the student track if the student has one

Use this route when the frontend needs a full profile view for one account.

### `GET /users/email/:email`
Purpose: fetch one user by email address.

This is useful during auth flows, admin search, or account recovery screens.

### `PATCH /users/:id`
Purpose: update editable user fields.

Typical updates include:

- first or last name
- role changes
- company association
- student track association

The route keeps the user identity intact and only changes the editable profile fields.

### `DELETE /users/:id`
Purpose: soft-delete a user.

The user is not removed permanently; the record is flagged as deleted so it can be restored later.

The action is also written to the audit log.

### `PATCH /users/:id/restore`
Purpose: restore a soft-deleted user.

This route is permission-protected and uses deleted-row lookup so restore works on archived records.

The action is written to the audit log.

## Companies APIs

### `POST /companies`
Purpose: create a company profile.

The record can later be approved, rejected, linked to invitations, and linked to job profiles or branding speakers.

### `GET /companies`
Purpose: list companies with pagination and optional status filtering.

Query parameters:

- `status`: filter by company approval status.
- `page`: page number.
- `limit`: page size.

Use this route for company management dashboards.

### `GET /companies/:id`
Purpose: fetch one company by UUID.

The loaded relations make this route suitable for admin detail pages and company dashboards.

### `PATCH /companies/:id`
Purpose: update company profile fields such as name, location, or description.

### `PATCH /companies/:id/approve`
Purpose: mark a company as approved.

This is typically used by admin or staff workflows after reviewing a company application.

### `PATCH /companies/:id/reject`
Purpose: mark a company as rejected.

Rejected companies remain in the database for traceability and audit history.

### `DELETE /companies/:id`
Purpose: soft-delete a company.

This keeps the record available for restore and audit review.

### `PATCH /companies/:id/restore`
Purpose: restore a soft-deleted company.

Use this when a previously deleted company should reappear in active lists.

## Tracks APIs

### `POST /tracks`
Purpose: create a track used to group students.

```json
{
  "name": "Software Engineering",
  "description": "Backend and frontend engineering track"
}
```

### `GET /tracks`
Purpose: list tracks in creation order.

Each track response includes the assigned students so the frontend can render the track overview without extra requests.

Query parameters:

- `page`
- `limit`

### `GET /tracks/:id`
Purpose: fetch one track with its assigned students.

### `PATCH /tracks/:id`
Purpose: update the track name or description.

### `DELETE /tracks/:id`
Purpose: delete a track that is no longer needed.

### `GET /tracks/:id/students`
Purpose: return only the students assigned to a track.

Use this route when you need a student roster view for a specific track.

## Events APIs

### `POST /events`
Purpose: create an event.

The request can include nested venues and agenda items, which makes this route suitable for building the full event in one call.

The event type and date range are validated by the backend.

### `GET /events`
Purpose: list events in creation order with pagination.

Query parameters:

- `page`: page number.
- `limit`: page size.

Use this route for event listing pages, dashboards, and job-fair selectors.

### `GET /events/:id`
Purpose: fetch one event by UUID.

The response includes the event details plus related venues and agenda items.

### `PATCH /events/:id`
Purpose: update event details, such as title, dates, description, or status.

### `DELETE /events/:id`
Purpose: soft-delete an event.

Deleted events can be restored later.

### `PATCH /events/:id/restore`
Purpose: restore a soft-deleted event.

This route is available so the API can recover archived events without creating a new one.

## Attendance APIs

### `POST /attendance/check-in`
Purpose: record that a student has checked into an event.

Important: the backend rejects duplicate check-ins for the same student and event.

The route is useful for reception desks, QR scanning flows, or manual attendance tools.

```json
{
  "eventId": "uuid",
  "studentId": "uuid"
}
```

### `GET /attendance`
Purpose: list attendance records with optional event and student filters.

Query parameters:

- `eventId`: show only attendance for one event.
- `studentId`: show only one student’s attendance.
- `page`: page number.
- `limit`: page size.

This endpoint is the main attendance reporting view.

Query parameters:

- `eventId`
- `studentId`
- `page`
- `limit`

### `GET /attendance/:id`
Purpose: fetch one attendance record by UUID.

### `DELETE /attendance/:id`
Purpose: delete an attendance entry when a check-in needs correction.

## Feedback APIs

### `POST /feedback`
Purpose: create feedback attached to exactly one target.

Target rules:

- `targetType` must match the provided target id.
- Exactly one of `eventId`, `companyId`, or `interviewId` must be provided.

This route is used for event feedback, company feedback, or interview feedback from one unified model.

Request body contains:

- `targetType`
- optional `eventId`
- optional `companyId`
- optional `interviewId`
- `rating`
- optional `comments`
- optional `isMandatory`

### `GET /feedback`
Purpose: list feedback entries in creation order with pagination.

Use this route for moderation dashboards or analytics pages.

Query parameters:

- `page`
- `limit`

### `GET /feedback/:id`
Purpose: fetch one feedback entry by UUID.

### `PATCH /feedback/:id`
Purpose: update feedback fields such as score, comments, mandatory flag, or target linkage.

### `DELETE /feedback/:id`
Purpose: delete a feedback entry.

## Student CV APIs

### `POST /student-cvs/upload`
Purpose: upload a PDF CV for the authenticated student.

Fields:

- `file` required, PDF only
- `title` optional

This route stores the file in `uploads/cvs` and links it to the student account behind the bearer token.

Swagger supports multipart testing for this endpoint, so this can be verified directly in the browser.

### `GET /student-cvs`
Purpose: list student CV records with student and user relations loaded.

Query parameters:

- `page`
- `limit`

### `GET /student-cvs/:id`
Purpose: fetch one CV record.

### `PATCH /student-cvs/:id`
Purpose: update a CV title or primary flag.

### `DELETE /student-cvs/:id`
Purpose: delete a CV record.

## Job Profiles APIs

### `POST /job-profiles`
Purpose: create a job profile linked to a company and an event.

This record is the main entry that drives queueing and interview workflow for the job-fair flow.

### `GET /job-profiles`
Purpose: list job profiles with pagination.

Query parameters:

- `eventId`: filter profiles for one event.
- `companyId`: filter profiles for one company.
- `page`: page number.
- `limit`: page size.

Query parameters:

- `eventId`
- `companyId`
- `page`
- `limit`

### `GET /job-profiles/:id`
Purpose: fetch one job profile with company and event data.

### `PATCH /job-profiles/:id`
Purpose: update editable profile fields such as title, description, position count, or interview type.

### `PATCH /job-profiles/:id/approve`
Purpose: approve a job profile so it can be used in the interview and queue flow.

### `DELETE /job-profiles/:id`
Purpose: delete a job profile.

## Branding Speaker APIs

### `POST /branding-speakers`
Purpose: create a speaker entry for event branding sessions.

### `GET /branding-speakers`
Purpose: list branding speakers with pagination.

Query parameters:

- `eventId`
- `companyId`
- `page`
- `limit`

### `GET /branding-speakers/:id`
Purpose: fetch one branding speaker by UUID.

### `PATCH /branding-speakers/:id`
Purpose: update speaker details such as name, title, or session notes.

### `DELETE /branding-speakers/:id`
Purpose: delete a branding speaker.

## Company Invitations APIs

### `POST /invitations`
Purpose: create a company invitation and generate a unique invitation token.

The generated token is what the invited company uses to accept or reject the invitation.

### `GET /invitations`
Purpose: list invitations with pagination.

Query parameters:

- `eventId`: filter invitations for one event.
- `page`: page number.
- `limit`: page size.

Query parameters:

- `eventId`
- `page`
- `limit`

### `GET /invitations/token/:token`
Purpose: fetch an invitation by its public token.

This is the route used by invitation accept/reject flows.

### `GET /invitations/:id`
Purpose: fetch one invitation by UUID.

### `PATCH /invitations/:id`
Purpose: update invitation metadata or status.

### `POST /invitations/accept/:token`
Purpose: accept an invitation using the token sent to the company.

### `POST /invitations/reject/:token`
Purpose: reject an invitation using the token sent to the company.

### `DELETE /invitations/:id`
Purpose: delete an invitation record.

## Interviews APIs

### `POST /interviews`
Purpose: create an interview record for a queue entry.

The interview typically starts after a student is moved from the queue into the interview flow.

### `GET /interviews`
Purpose: list interviews in creation order with pagination.

Query parameters:

- `page`
- `limit`

### `GET /interviews/:id`
Purpose: fetch one interview by UUID.

### `PATCH /interviews/:id`
Purpose: update the interview result, notes, and completion state.

This is also where the audit log records the result change.

## Interview Queue APIs

### `POST /queues`
Purpose: add a student to a job-profile queue.

The queue entry is what drives the interview processing order.

### `GET /queues`
Purpose: list queue entries with pagination.

Query parameters:

- `jobProfileId`: show queue entries for one job profile.
- `studentId`: show queue entries for one student.
- `page`: page number.
- `limit`: page size.

Query parameters:

- `jobProfileId`
- `studentId`
- `page`
- `limit`

### `GET /queues/job-profile/:id/next`
Purpose: return the next waiting student for one job profile.

This route does not mutate the queue; it only identifies the next eligible student.

### `GET /queues/:id`
Purpose: fetch one queue entry by UUID.

### `PATCH /queues/:id/status`
Purpose: update a queue status directly using the enum value.

Use this for workflow transitions that are not covered by the shortcut endpoints below.

### `PATCH /queues/:id/skip`
Purpose: mark a queue entry as skipped.

Useful when the student was not available or the interviewer wants to move on temporarily.

### `PATCH /queues/:id/halt`
Purpose: mark a queue entry as halted.

Useful when the queue needs to pause before it continues again.

### `PATCH /queues/:id/resume`
Purpose: move a halted or skipped queue entry back to waiting.

### `DELETE /queues/:id`
Purpose: remove a student from the queue.

Use this when the queue entry is no longer relevant.

## Swagger Testing Notes

- Use the Authorize button in Swagger UI to paste the access token.
- `multipart/form-data` endpoints like student CV upload can be tested directly in Swagger.
- List endpoints return pagination metadata so the frontend can render page controls without extra calculation.
- Restore routes require authorization and work with soft-deleted records.
- If a route returns `403`, the user is authenticated but not allowed by the current CASL rule.
- If a route returns `404`, the resource may not exist or may be hidden by the current authorization context.

## Implementation Notes

- Successful responses are wrapped by `TransformInterceptor`.
- Errors are wrapped by `HttpExceptionFilter`.
- CASL v6 handles authorization and ownership checks.
- Soft delete and restore flows are supported on core entities.
- Pagination is standardized through shared DTO and utility helpers.
- The API is documented in code with Swagger decorators so the OpenAPI output stays in sync with the implementation.
