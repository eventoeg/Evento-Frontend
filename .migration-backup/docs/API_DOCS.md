# ITI EMS API

> **Version:** 1.0 | **Generated:** 2026-04-11

ITI Employment Management System API. Use the bearer token scheme in Swagger UI to test protected endpoints, including multipart uploads, pagination, and restore flows.

## Authentication

This API uses **Bearer Token (JWT)** authentication.

- **Scheme:** access-token
- **Type:** http
- **Format:** JWT
- **Header:** `Authorization: Bearer <token>`

**Note:** After logging in via `POST /auth/login`, include the returned access token in the `Authorization` header for all protected endpoints.

## Table of Contents

- [App](app) — Application health and status endpoints
- [Authentication](authentication) — User authentication, registration, and token management
- [Users](users) — User account management and profiles
- [Companies](companies) — Company registration and management
- [Tracks](tracks) — Training tracks and programs
- [Student CVs](student-cvs) — Student curriculum vitae management
- [Events](events) — Event creation and management
- [JobFair](jobfair)
- [Job Profiles](job-profiles)
- [Company Invitations](company-invitations)
- [Branding Speakers](branding-speakers)
- [Interview Queues](interview-queues)
- [Interviews](interviews) — Interview scheduling and management
- [Feedback](feedback) — User feedback and reviews
- [Attendance](attendance) — Attendance tracking

---

## App

Application health and status endpoints

### GET `/`

**Operation ID:** `AppController_getHello`

#### Responses

##### 200 Success

No response body.

---

## Authentication

User authentication, registration, and token management

### POST `/auth/login`

Login with email and password

Authenticates a user with local credentials and returns an access token plus a refresh token.

**Operation ID:** `AuthController_login`

#### Request Body

**Content-Type:** `application/json`

Reference: [`LoginDto`](#logindto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Returns access and refresh tokens

No response body.

##### 401 Invalid credentials

No response body.

---

### POST `/auth/register`

Register a new user account

Creates a new account, validates uniqueness, and returns the initial token pair used for immediate authentication.

**Operation ID:** `AuthController_register`

#### Request Body

**Content-Type:** `application/json`

Reference: [`RegisterDto`](#registerdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Account created, returns tokens

No response body.

##### 409 Email already exists

No response body.

---

### POST `/auth/refresh`

Refresh access token using a refresh token

Validates the refresh token and returns a new access token pair without forcing the user to log in again.

**Operation ID:** `AuthController_refresh`

#### Request Body

**Content-Type:** `application/json`

Reference: [`RefreshTokenDto`](#refreshtokendto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Returns new token pair

No response body.

##### 401 Invalid or expired refresh token

No response body.

---

### GET `/auth/profile`

Get current authenticated user profile

Returns the authenticated user profile associated with the bearer token currently stored in Swagger UI.

**Operation ID:** `AuthController_getProfile`

🔒 **Requires Authentication**

#### Responses

##### 200 Returns the user profile

No response body.

##### 401 Not authenticated

No response body.

---

## Users

User account management and profiles

### POST `/users`

Create a new user

Creates a new user record and links it to the requested role and profile data.

**Operation ID:** `UsersController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateUserDto`](#createuserdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 User created successfully

No response body.

##### 400 Bad Request - Validation failed (e.g., trackId required for students)

No response body.

##### 409 Conflict - User with this email already exists

No response body.

---

### GET `/users`

Get all users

Returns a paginated list of users ordered by creation time.

**Operation ID:** `UsersController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Returns all users with their related entities

No response body.

---

### GET `/users/{id}`

Get a user by ID

Fetches one user by UUID together with the related profile data.

**Operation ID:** `UsersController_findById`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | User UUID |

#### Responses

##### 200 Returns the user

No response body.

##### 404 User not found

No response body.

---

### GET `/users/email/{email}`

Get a user by email

Fetches one user by email address.

**Operation ID:** `UsersController_findByEmail`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | ✅ Yes | User email address |

#### Responses

##### 200 Returns the user

No response body.

##### 404 User not found

No response body.

---

### PATCH `/users/{id}`

Update a user

Updates editable user profile fields such as name, contact data, or role.

**Operation ID:** `UsersController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | User UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateUserDto`](#updateuserdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 User updated successfully

No response body.

##### 404 User not found

No response body.

---

### PATCH `/users/{id}/restore`

Restore a deleted user

Restores a soft-deleted user and records the restore action in the audit log.

**Operation ID:** `UsersController_restore`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | User UUID |

#### Responses

##### 200 User restored successfully

No response body.

##### 404 User not found

No response body.

---

### DELETE `/users/{id}`

Delete a user

Soft-deletes a user and writes an audit log entry for the action.

**Operation ID:** `UsersController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | User UUID |

#### Responses

##### 200 User deleted successfully

No response body.

##### 404 User not found

No response body.

---

## Companies

Company registration and management

### POST `/companies`

Create a new company

Creates a company record that can later be approved, rejected, or linked to job-fair resources.

**Operation ID:** `CompaniesController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateCompanyDto`](#createcompanydto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Company created successfully

No response body.

---

### GET `/companies`

Get all companies

Returns a paginated list of companies with optional status filtering.

**Operation ID:** `CompaniesController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `approved` | `pending` | `rejected` | No | Filter by status |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Returns all companies

No response body.

---

### GET `/companies/{id}`

Get a company by ID

Fetches one company by UUID together with related associations.

**Operation ID:** `CompaniesController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Responses

##### 200 Returns the company

No response body.

##### 404 Company not found

No response body.

---

### PATCH `/companies/{id}`

Update a company

Updates editable company fields such as name, location, or description.

**Operation ID:** `CompaniesController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateCompanyDto`](#updatecompanydto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Company updated successfully

No response body.

##### 404 Company not found

No response body.

---

### PATCH `/companies/{id}/approve`

Approve a company

Marks the company as approved so it can participate in workflows and job-fair features.

**Operation ID:** `CompaniesController_approve`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Responses

##### 200 Company approved successfully

No response body.

##### 404 Company not found

No response body.

---

### PATCH `/companies/{id}/reject`

Reject a company

Marks the company as rejected and prevents it from progressing in the approval workflow.

**Operation ID:** `CompaniesController_reject`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Responses

##### 200 Company rejected successfully

No response body.

##### 404 Company not found

No response body.

---

### PATCH `/companies/{id}/restore`

Restore a deleted company

Restores a soft-deleted company back into the active dataset.

**Operation ID:** `CompaniesController_restore`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Responses

##### 200 Company restored successfully

No response body.

##### 404 Company not found

No response body.

---

### DELETE `/companies/{id}`

Delete a company

Soft-deletes a company and preserves its history for auditing and restore operations.

**Operation ID:** `CompaniesController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Company UUID |

#### Responses

##### 200 Company deleted successfully

No response body.

##### 404 Company not found

No response body.

---

## Tracks

Training tracks and programs

### POST `/tracks`

Create a new track

Creates an academic track that students can later be assigned to.

**Operation ID:** `TracksController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateTrackDto`](#createtrackdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Track created successfully

No response body.

##### 400 Bad Request - Validation failed

No response body.

---

### GET `/tracks`

Get all tracks

Returns all tracks in creation order with the assigned students loaded.

**Operation ID:** `TracksController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Returns all tracks with their students

No response body.

---

### GET `/tracks/{id}`

Get a track by ID

Fetches one track by UUID together with its assigned students.

**Operation ID:** `TracksController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Track UUID |

#### Responses

##### 200 Returns the track with its students

No response body.

##### 404 Track not found

No response body.

---

### GET `/tracks/{id}/students`

Get all students in a track

Returns every student assigned to the specified track.

**Operation ID:** `TracksController_getStudents`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Track UUID |

#### Responses

##### 200 Returns all students in the track

No response body.

##### 404 Track not found

No response body.

---

### PATCH `/tracks/{id}`

Update a track

Updates the track name or description.

**Operation ID:** `TracksController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Track UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateTrackDto`](#updatetrackdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Track updated successfully

No response body.

##### 404 Track not found

No response body.

---

### DELETE `/tracks/{id}`

Delete a track

Deletes a track after checking it is no longer needed.

**Operation ID:** `TracksController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Track UUID |

#### Responses

##### 200 Track deleted successfully

No response body.

##### 404 Track not found

No response body.

---

## Student CVs

Student curriculum vitae management

### POST `/student-cvs/upload`

Upload a student CV

Uploads a PDF CV for the authenticated student. The first uploaded CV becomes the primary CV automatically unless another one is marked as primary explicitly.

**Operation ID:** `StudentCvsController_uploadCv`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `multipart/form-data`

> This endpoint accepts **multipart/form-data** (file upload).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `string` | ✅ Yes | - |
| `title` | `string` |  | - |

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Success

No response body.

---

### GET `/student-cvs`

List student CVs

Returns CV records with the linked student and user data, using standard pagination metadata.

**Operation ID:** `StudentCvsController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 CV records returned successfully

No response body.

---

### GET `/student-cvs/{id}`

Get a student CV

Fetches a single CV record by UUID.

**Operation ID:** `StudentCvsController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | CV UUID |

#### Responses

##### 200 CV record returned successfully

No response body.

##### 404 CV not found

No response body.

---

### PATCH `/student-cvs/{id}`

Update a student CV

Updates editable CV fields such as title or primary flag.

**Operation ID:** `StudentCvsController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | CV UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateStudentCvDto`](#updatestudentcvdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 CV updated successfully

No response body.

##### 404 CV not found

No response body.

---

### DELETE `/student-cvs/{id}`

Delete a student CV

Removes a CV record from the authenticated student profile.

**Operation ID:** `StudentCvsController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | CV UUID |

#### Responses

##### 200 CV deleted successfully

No response body.

##### 404 CV not found

No response body.

---

## Events

Event creation and management

### POST `/events`

Create an event

Creates a new event with venues and agenda items. The request can include nested venue and agenda payloads.

**Operation ID:** `EventsController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateEventDto`](#createeventdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Event created successfully

No response body.

##### 400 Invalid event payload

No response body.

---

### GET `/events`

List events

Returns paginated events. The list is ordered by creation time and can be expanded with venue and agenda data.

**Operation ID:** `EventsController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Events returned successfully

No response body.

---

### GET `/events/{id}`

Get an event

Fetches a single event by UUID, including related venues and agenda items.

**Operation ID:** `EventsController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Event UUID |

#### Responses

##### 200 Event returned successfully

No response body.

##### 404 Event not found

No response body.

---

### PATCH `/events/{id}`

Update an event

Updates event details, including dates, status, description, and nested child items if provided.

**Operation ID:** `EventsController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Event UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateEventDto`](#updateeventdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Event updated successfully

No response body.

##### 404 Event not found

No response body.

---

### PATCH `/events/{id}/restore`

Restore a deleted event

Restores a soft-deleted event so it becomes visible again in the API and UI.

**Operation ID:** `EventsController_restore`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Event UUID |

#### Responses

##### 200 Event restored successfully

No response body.

##### 404 Event not found

No response body.

---

### DELETE `/events/{id}`

Delete an event

Soft-deletes the selected event and its related data when supported by the service layer.

**Operation ID:** `EventsController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Event UUID |

#### Responses

##### 200 Event deleted successfully

No response body.

##### 404 Event not found

No response body.

---

## JobFair

### POST `/job-fair`

**Operation ID:** `JobFairController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateJobFairDto`](#createjobfairdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Success

No response body.

---

### GET `/job-fair`

**Operation ID:** `JobFairController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `string` | ✅ Yes | - |
| `page` | `number` | ✅ Yes | - |
| `limit` | `number` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### GET `/job-fair/{id}`

**Operation ID:** `JobFairController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### PATCH `/job-fair/{id}`

**Operation ID:** `JobFairController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateJobFairDto`](#updatejobfairdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Success

No response body.

---

### PATCH `/job-fair/{id}/restore`

**Operation ID:** `JobFairController_restore`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### DELETE `/job-fair/{id}`

**Operation ID:** `JobFairController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

## Job Profiles

### POST `/job-profiles`

Create a new job profile

Creates a job profile for an event and company. This is the record used to drive the interview queue and approval workflow.

**Operation ID:** `JobProfilesController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateJobProfileDto`](#createjobprofiledto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Job profile created successfully

No response body.

---

### GET `/job-profiles`

Get all job profiles

Returns paginated job profiles, optionally filtered by event or company.

**Operation ID:** `JobProfilesController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | `string` | No | Filter by event ID |
| `companyId` | `string` | No | Filter by company ID |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Maximum number of records per page (default: `20`) |

#### Responses

##### 200 Returns all job profiles

No response body.

---

### GET `/job-profiles/{id}`

Get a job profile by ID

Fetches one job profile with its linked company and event data.

**Operation ID:** `JobProfilesController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Job profile UUID |

#### Responses

##### 200 Returns the job profile

No response body.

##### 404 Job profile not found

No response body.

---

### PATCH `/job-profiles/{id}`

Update a job profile

Updates the editable fields of a job profile, such as title, description, positions, or interview type.

**Operation ID:** `JobProfilesController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Job profile UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateJobProfileDto`](#updatejobprofiledto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Job profile updated successfully

No response body.

##### 404 Job profile not found

No response body.

---

### PATCH `/job-profiles/{id}/approve`

Approve a job profile

Marks a job profile as approved so it can move forward in the hiring workflow.

**Operation ID:** `JobProfilesController_approve`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Job profile UUID |

#### Responses

##### 200 Job profile approved successfully

No response body.

##### 404 Job profile not found

No response body.

---

### DELETE `/job-profiles/{id}`

Delete a job profile

Removes a job profile from the system and disconnects it from active workflows.

**Operation ID:** `JobProfilesController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Job profile UUID |

#### Responses

##### 200 Job profile deleted successfully

No response body.

##### 404 Job profile not found

No response body.

---

## Company Invitations

### POST `/invitations`

Create a new company invitation

Generates a new invitation token and links it to a company and event so the company can accept or reject it later.

**Operation ID:** `InvitationsController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateCompanyInvitationDto`](#createcompanyinvitationdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Invitation created successfully

No response body.

---

### POST `/invitations/accept/{token}`

Accept an invitation via token

Marks the invitation as accepted using the invitation token.

**Operation ID:** `InvitationsController_accept`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Invitation token |

#### Responses

##### 200 Invitation accepted successfully

No response body.

##### 404 Invitation not found

No response body.

---

### POST `/invitations/reject/{token}`

Reject an invitation via token

Marks the invitation as rejected using the invitation token.

**Operation ID:** `InvitationsController_reject`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Invitation token |

#### Responses

##### 200 Invitation rejected successfully

No response body.

##### 404 Invitation not found

No response body.

---

### GET `/invitations`

Get all invitations

Returns paginated invitations with optional filtering by event.

**Operation ID:** `InvitationsController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | `string` | No | Filter by event ID |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Maximum number of records per page (default: `20`) |

#### Responses

##### 200 Returns all invitations

No response body.

---

### GET `/invitations/token/{token}`

Get invitation by token

Fetches a single invitation by its public token value, which is used by accept and reject flows.

**Operation ID:** `InvitationsController_findByToken`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Invitation token |

#### Responses

##### 200 Returns the invitation

No response body.

##### 404 Invitation not found

No response body.

---

### GET `/invitations/{id}`

Get an invitation by ID

Fetches one invitation with its related company and event.

**Operation ID:** `InvitationsController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Invitation UUID |

#### Responses

##### 200 Returns the invitation

No response body.

##### 404 Invitation not found

No response body.

---

### PATCH `/invitations/{id}`

Update an invitation

Updates invitation fields such as status or linked relations.

**Operation ID:** `InvitationsController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Invitation UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateCompanyInvitationDto`](#updatecompanyinvitationdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Invitation updated successfully

No response body.

##### 404 Invitation not found

No response body.

---

### DELETE `/invitations/{id}`

Delete an invitation

Removes an invitation record from the system.

**Operation ID:** `InvitationsController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Invitation UUID |

#### Responses

##### 200 Invitation deleted successfully

No response body.

##### 404 Invitation not found

No response body.

---

## Branding Speakers

### POST `/branding-speakers`

Register a new branding speaker

Creates a speaker entry used by event branding or promotional sessions.

**Operation ID:** `BrandingController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateBrandingSpeakerDto`](#createbrandingspeakerdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Speaker registered successfully

No response body.

---

### GET `/branding-speakers`

Get all branding speakers

Returns paginated branding speakers, optionally filtered by event or company.

**Operation ID:** `BrandingController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | `string` | No | Filter by event ID |
| `companyId` | `string` | No | Filter by company ID |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Maximum number of records per page (default: `20`) |

#### Responses

##### 200 Returns all branding speakers

No response body.

---

### GET `/branding-speakers/{id}`

Get a branding speaker by ID

Fetches one branding speaker with its linked company and event.

**Operation ID:** `BrandingController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Speaker UUID |

#### Responses

##### 200 Returns the speaker

No response body.

##### 404 Speaker not found

No response body.

---

### PATCH `/branding-speakers/{id}`

Update a branding speaker

Updates the speaker name, title, session details, or relationships.

**Operation ID:** `BrandingController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Speaker UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateBrandingSpeakerDto`](#updatebrandingspeakerdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Speaker updated successfully

No response body.

##### 404 Speaker not found

No response body.

---

### DELETE `/branding-speakers/{id}`

Delete a branding speaker

Removes a branding speaker entry from the event schedule.

**Operation ID:** `BrandingController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Speaker UUID |

#### Responses

##### 200 Speaker deleted successfully

No response body.

##### 404 Speaker not found

No response body.

---

## Interview Queues

### POST `/queues`

Join an interview queue

Creates a queue entry for a student and job profile so they can be processed in order.

**Operation ID:** `QueuesController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateQueueEntryDto`](#createqueueentrydto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Successfully joined the queue

No response body.

##### 400 Already in queue

No response body.

---

### GET `/queues`

Get all queue entries

Returns paginated queue entries with optional filtering by job profile or student.

**Operation ID:** `QueuesController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobProfileId` | `string` | No | Filter by job profile ID |
| `studentId` | `string` | No | Filter by student ID |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Maximum number of records per page (default: `20`) |

#### Responses

##### 200 Returns all queue entries

No response body.

---

### GET `/queues/job-profile/{id}/next`

Get next student in queue for a job profile

Returns the next available student entry for the specified job profile without mutating queue state.

**Operation ID:** `QueuesController_getNext`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Job profile UUID |

#### Responses

##### 200 Returns next student in queue

No response body.

---

### GET `/queues/{id}`

Get a queue entry by ID

Fetches one queue entry with related job profile and student details.

**Operation ID:** `QueuesController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Queue entry UUID |

#### Responses

##### 200 Returns the queue entry

No response body.

##### 404 Queue entry not found

No response body.

---

### PATCH `/queues/{id}/status`

Update queue entry status

Updates the queue status to any allowed value in the status enum.

**Operation ID:** `QueuesController_updateStatus`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Queue entry UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateQueueStatusDto`](#updatequeuestatusdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Queue status updated successfully

No response body.

##### 404 Queue entry not found

No response body.

---

### PATCH `/queues/{id}/skip`

Skip a queue entry

Moves the queue entry into the skipped state.

**Operation ID:** `QueuesController_skip`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### PATCH `/queues/{id}/halt`

Halt a queue entry

Moves the queue entry into the halted state.

**Operation ID:** `QueuesController_halt`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### PATCH `/queues/{id}/resume`

Resume a halted/skipped queue entry

Returns a halted or skipped queue entry back to the waiting state.

**Operation ID:** `QueuesController_resume`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | - |

#### Responses

##### 200 Success

No response body.

---

### DELETE `/queues/{id}`

Remove from queue

Deletes the queue entry and removes the student from the active queue list.

**Operation ID:** `QueuesController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Queue entry UUID |

#### Responses

##### 200 Removed from queue successfully

No response body.

##### 404 Queue entry not found

No response body.

---

## Interviews

Interview scheduling and management

### POST `/interviews`

Start an interview

Creates an interview record linked to a queue entry and interviewer name.

**Operation ID:** `InterviewsController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateInterviewDto`](#createinterviewdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Interview started successfully

No response body.

---

### GET `/interviews`

Get all interviews

Returns paginated interviews with the related queue entry and actor metadata.

**Operation ID:** `InterviewsController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Returns all interviews

No response body.

---

### GET `/interviews/{id}`

Get an interview by ID

Fetches one interview record by UUID.

**Operation ID:** `InterviewsController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Interview UUID |

#### Responses

##### 200 Returns the interview

No response body.

##### 404 Interview not found

No response body.

---

### PATCH `/interviews/{id}`

Update interview result and notes

Updates the interview outcome, notes, and any follow-up details captured by the interviewer.

**Operation ID:** `InterviewsController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Interview UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateInterviewDto`](#updateinterviewdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Interview updated successfully

No response body.

##### 404 Interview not found

No response body.

---

## Feedback

User feedback and reviews

### POST `/feedback`

Create feedback

Stores a feedback record for an event, company, or interview. Use the targetType field to indicate what the feedback is about.

**Operation ID:** `FeedbackController_create`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateFeedbackDto`](#createfeedbackdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Feedback created successfully

No response body.

##### 400 Invalid feedback payload

No response body.

---

### GET `/feedback`

List feedback records

Returns feedback records in a paginated format. The response includes the related target context when available.

**Operation ID:** `FeedbackController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Feedback records returned successfully

No response body.

---

### GET `/feedback/{id}`

Get a feedback record

Fetches a single feedback entry by UUID.

**Operation ID:** `FeedbackController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Feedback UUID |

#### Responses

##### 200 Feedback record returned successfully

No response body.

##### 404 Feedback not found

No response body.

---

### PATCH `/feedback/{id}`

Update a feedback record

Updates an existing feedback entry, including score, comments, or mandatory state.

**Operation ID:** `FeedbackController_update`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Feedback UUID |

#### Request Body

**Content-Type:** `application/json`

Reference: [`UpdateFeedbackDto`](#updatefeedbackdto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 200 Feedback updated successfully

No response body.

##### 404 Feedback not found

No response body.

---

### DELETE `/feedback/{id}`

Delete a feedback record

Permanently removes a feedback entry from the system.

**Operation ID:** `FeedbackController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Feedback UUID |

#### Responses

##### 200 Feedback deleted successfully

No response body.

##### 404 Feedback not found

No response body.

---

## Attendance

Attendance tracking

### POST `/attendance/check-in`

Check a student into an event

Creates an attendance record for a student at a specific event. This is used when the student arrives and their presence is recorded.

**Operation ID:** `AttendanceController_checkIn`

🔒 **Requires Authentication**

#### Request Body

**Content-Type:** `application/json`

Reference: [`CreateAttendanceDto`](#createattendancedto)

> **Required:** This endpoint requires a request body.

#### Responses

##### 201 Attendance recorded successfully

No response body.

##### 400 Invalid attendance payload

No response body.

---

### GET `/attendance`

List attendance records

Returns attendance records with optional filters for event and student, plus standard pagination metadata.

**Operation ID:** `AttendanceController_findAll`

🔒 **Requires Authentication**

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | `string` | No | Filter records by event UUID |
| `studentId` | `string` | No | Filter records by student UUID |
| `page` | `number` | No | Page number, starting from 1 (default: `1`) |
| `limit` | `number` | No | Number of records per page (default: `20`) |

#### Responses

##### 200 Attendance records returned successfully

No response body.

---

### GET `/attendance/{id}`

Get a single attendance record

Fetches one attendance entry by UUID, including the related event and student data.

**Operation ID:** `AttendanceController_findOne`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Attendance record UUID |

#### Responses

##### 200 Attendance record returned successfully

No response body.

##### 404 Attendance record not found

No response body.

---

### DELETE `/attendance/{id}`

Delete an attendance record

Removes an attendance entry when a check-in needs to be corrected.

**Operation ID:** `AttendanceController_remove`

🔒 **Requires Authentication**

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Attendance record UUID |

#### Responses

##### 200 Attendance record deleted successfully

No response body.

##### 404 Attendance record not found

No response body.

---

---

## Data Models

> Schema definitions used across the API.

### LoginDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ Yes | User email address |
| `password` | `string` | ✅ Yes | User password |

```json
{
  "email": "string",
  "password": "string"
}
```

### RegisterDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | ✅ Yes | First name |
| `lastName` | `string` | ✅ Yes | Last name |
| `email` | `string` | ✅ Yes | Email address (must be unique) |
| `password` | `string` | ✅ Yes | Password (minimum 6 characters) |
| `role` | `admin` | `staff` | `student` | `security` | `company_rep` |  | User role. Defaults to student. |
| `companyId` | `string` |  | Company ID (required for company_rep role) |
| `trackId` | `string` | ✅ Yes | Track ID (required for students) |
| `graduationYear` | `number` |  | Expected graduation year for students |

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "admin",
  "companyId": "string",
  "trackId": "string",
  "graduationYear": 2025
}
```

### RefreshTokenDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | `string` | ✅ Yes | The refresh token issued at login |

```json
{
  "refreshToken": "string"
}
```

### CreateUserDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | ✅ Yes | First name of the user |
| `lastName` | `string` | ✅ Yes | Last name of the user |
| `email` | `string` | ✅ Yes | Email address of the user (must be unique) |
| `password` | `string` | ✅ Yes | Password for the user account (minimum 6 characters) |
| `role` | `admin` | `staff` | `student` | `security` | `company_rep` |  | Role of the user. Defaults to "student" if not provided. |
| `companyId` | `string` |  | Company ID to associate user with (only for company_rep role) |
| `trackId` | `string` | ✅ Yes | Track ID - REQUIRED for students. The track the student will be assigned to. |
| `graduationYear` | `number` |  | Expected graduation year for students |

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "admin",
  "companyId": "string",
  "trackId": "string",
  "graduationYear": 2025
}
```

### UpdateUserDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` |  | First name of the user |
| `lastName` | `string` |  | Last name of the user |
| `email` | `string` |  | Email address of the user |
| `password` | `string` |  | New password for the user account |
| `role` | `admin` | `staff` | `student` | `security` | `company_rep` |  | Change the role for a user |
| `companyId` | `string` |  | Company ID to associate user with (only for company_rep role) |
| `trackId` | `string` |  | Change the track for a student |
| `graduationYear` | `number` |  | Expected graduation year for students |

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "admin",
  "companyId": "string",
  "trackId": "string",
  "graduationYear": 2025
}
```

### CreateCompanyDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyName` | `string` | ✅ Yes | Company name |
| `location` | `string` | ✅ Yes | Company location |
| `description` | `string` | ✅ Yes | Company description |
| `status` | `approved` | `pending` | `rejected` |  | Company status |

```json
{
  "companyName": "string",
  "location": "string",
  "description": "string",
  "status": "approved"
}
```

### UpdateCompanyDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyName` | `string` |  | Company name |
| `location` | `string` |  | Company location |
| `description` | `string` |  | Company description |
| `status` | `approved` | `pending` | `rejected` |  | Company status |

```json
{
  "companyName": "string",
  "location": "string",
  "description": "string",
  "status": "approved"
}
```

### CreateTrackDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ Yes | The name of the track |
| `description` | `string` | ✅ Yes | A short description of what the track covers |

```json
{
  "name": "string",
  "description": "string"
}
```

### UpdateTrackDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` |  | The name of the track |
| `description` | `string` |  | A short description of what the track covers |

```json
{
  "name": "string",
  "description": "string"
}
```

### UpdateStudentCvDto

```json
{}
```

### CreateVenueDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `venueName` | `string` | ✅ Yes | - |
| `capacity` | `number` | ✅ Yes | - |

```json
{
  "venueName": "string",
  "capacity": 500
}
```

### CreateAgendaDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `itemType` | `session` | `break` | `branding_day` | ✅ Yes | Type of agenda item |
| `startTime` | `string` | ✅ Yes | Start time in HH:mm format |
| `endTime` | `string` | ✅ Yes | End time in HH:mm format |
| `details` | `string` | ✅ Yes | Detailed description of this agenda slot |

```json
{
  "itemType": "session",
  "startTime": "string",
  "endTime": "string",
  "details": "string"
}
```

### CreateEventDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✅ Yes | The title of the event |
| `eventType` | `internal` | `external_hosted` | `job_fair` | ✅ Yes | The category of the event |
| `status` | `draft` | `published` | `archived` | ✅ Yes | Current lifecycle status of the event |
| `description` | `string` | ✅ Yes | Detailed description of what the event entails |
| `startDate` | `string` | ✅ Yes | The start date and time in ISO 8601 format |
| `endDate` | `string` | ✅ Yes | The end date and time in ISO 8601 format (must be after startDate) |
| `venues` | `CreateVenueDto`[] |  | - |
| `agendas` | `CreateAgendaDto`[] |  | - |

```json
{
  "title": "string",
  "eventType": "internal",
  "status": "draft",
  "description": "string",
  "startDate": "string",
  "endDate": "string",
  "venues": [
    {}
  ],
  "agendas": [
    {}
  ]
}
```

### UpdateEventDto

Data structure for updating an existing event. All fields are optional.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` |  | The title of the event |
| `eventType` | `internal` | `external_hosted` | `job_fair` |  | The category of the event |
| `status` | `draft` | `published` | `archived` |  | Current lifecycle status of the event |
| `description` | `string` |  | Detailed description of what the event entails |
| `startDate` | `string` |  | The start date and time in ISO 8601 format |
| `endDate` | `string` |  | The end date and time in ISO 8601 format (must be after startDate) |
| `venues` | `CreateVenueDto`[] |  | - |
| `agendas` | `CreateAgendaDto`[] |  | - |

```json
{
  "title": "string",
  "eventType": "internal",
  "status": "draft",
  "description": "string",
  "startDate": "string",
  "endDate": "string",
  "venues": [
    {}
  ],
  "agendas": [
    {}
  ]
}
```

### CreateJobFairDto

```json
{}
```

### UpdateJobFairDto

```json
{}
```

### CreateJobProfileDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobTitle` | `string` | ✅ Yes | Job title for the position |
| `jobDescription` | `string` | ✅ Yes | Detailed job description |
| `requiredPositions` | `number` | ✅ Yes | Number of positions required |
| `interviewType` | `hr` | `technical` | `both` | ✅ Yes | Type of interview |
| `companyId` | `string` | ✅ Yes | Company ID (UUID) |
| `eventId` | `string` | ✅ Yes | Event ID (UUID) |

```json
{
  "jobTitle": "string",
  "jobDescription": "string",
  "requiredPositions": 0,
  "interviewType": "hr",
  "companyId": "string",
  "eventId": "string"
}
```

### UpdateJobProfileDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobTitle` | `string` |  | Job title for the position |
| `jobDescription` | `string` |  | Detailed job description |
| `requiredPositions` | `number` |  | Number of positions required |
| `interviewType` | `hr` | `technical` | `both` |  | Type of interview |
| `companyId` | `string` |  | Company ID (UUID) |
| `eventId` | `string` |  | Event ID (UUID) |

```json
{
  "jobTitle": "string",
  "jobDescription": "string",
  "requiredPositions": 0,
  "interviewType": "hr",
  "companyId": "string",
  "eventId": "string"
}
```

### CreateCompanyInvitationDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyId` | `string` | ✅ Yes | Company ID to invite (UUID) |
| `eventId` | `string` | ✅ Yes | Event ID for the invitation (UUID) |

```json
{
  "companyId": "string",
  "eventId": "string"
}
```

### UpdateCompanyInvitationDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyId` | `string` |  | Company ID to invite (UUID) |
| `eventId` | `string` |  | Event ID for the invitation (UUID) |
| `status` | `accepted` | `rejected` | `pending` |  | Status of the invitation |

```json
{
  "companyId": "string",
  "eventId": "string",
  "status": "accepted"
}
```

### CreateBrandingSpeakerDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `speakerName` | `string` | ✅ Yes | Name of the speaker |
| `speakerTitle` | `string` | ✅ Yes | Title/position of the speaker |
| `sessionDetails` | `string` | ✅ Yes | Session details or description |
| `companyId` | `string` | ✅ Yes | Company ID (UUID) |
| `eventId` | `string` | ✅ Yes | Event ID (UUID) |

```json
{
  "speakerName": "string",
  "speakerTitle": "string",
  "sessionDetails": "string",
  "companyId": "string",
  "eventId": "string"
}
```

### UpdateBrandingSpeakerDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `speakerName` | `string` |  | Name of the speaker |
| `speakerTitle` | `string` |  | Title/position of the speaker |
| `sessionDetails` | `string` |  | Session details or description |
| `companyId` | `string` |  | Company ID (UUID) |
| `eventId` | `string` |  | Event ID (UUID) |

```json
{
  "speakerName": "string",
  "speakerTitle": "string",
  "sessionDetails": "string",
  "companyId": "string",
  "eventId": "string"
}
```

### CreateQueueEntryDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobProfileId` | `string` | ✅ Yes | Job Profile ID (UUID) |
| `studentId` | `string` | ✅ Yes | Student ID (UUID) |

```json
{
  "jobProfileId": "string",
  "studentId": "string"
}
```

### UpdateQueueStatusDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `waiting` | `in_progress` | `skipped` | `halted` | `completed` | ✅ Yes | New queue status |

```json
{
  "status": "waiting"
}
```

### CreateInterviewDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `queueId` | `string` | ✅ Yes | Queue Entry ID (UUID) |
| `interviewerName` | `string` | ✅ Yes | Name of the interviewer |

```json
{
  "queueId": "string",
  "interviewerName": "string"
}
```

### UpdateInterviewDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `result` | `pending` | `passed` | `failed` | `hired` |  | Interview result |
| `notes` | `string` |  | Interview notes |

```json
{
  "result": "pending",
  "notes": "string"
}
```

### CreateFeedbackDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `event` | `company` | `interview` | ✅ Yes | The entity that the feedback is about |
| `eventId` | `string` |  | Related event UUID, if applicable |
| `companyId` | `string` |  | Related company UUID, if applicable |
| `interviewId` | `string` |  | Related interview UUID, if applicable |
| `rating` | `number` | ✅ Yes | Rating from 1 to 5 |
| `comments` | `string` |  | Free-form feedback comments |
| `isMandatory` | `boolean` |  | Whether the feedback is mandatory |

```json
{
  "targetType": "event",
  "eventId": "string",
  "companyId": "string",
  "interviewId": "string",
  "rating": 1,
  "comments": "string",
  "isMandatory": true
}
```

### UpdateFeedbackDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `event` | `company` | `interview` |  | The entity that the feedback is about |
| `eventId` | `string` |  | Related event UUID, if applicable |
| `companyId` | `string` |  | Related company UUID, if applicable |
| `interviewId` | `string` |  | Related interview UUID, if applicable |
| `rating` | `number` |  | Rating from 1 to 5 |
| `comments` | `string` |  | Free-form feedback comments |
| `isMandatory` | `boolean` |  | Whether the feedback is mandatory |

```json
{
  "targetType": "event",
  "eventId": "string",
  "companyId": "string",
  "interviewId": "string",
  "rating": 1,
  "comments": "string",
  "isMandatory": true
}
```

### CreateAttendanceDto

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | `string` | ✅ Yes | Event UUID to check into |
| `studentId` | `string` | ✅ Yes | Student UUID who is checking in |

```json
{
  "eventId": "string",
  "studentId": "string"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|--------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate resource) |
| `500` | Internal Server Error |

---

*Documentation generated automatically from OpenAPI/Swagger specification.*
