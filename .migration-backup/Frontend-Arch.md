# ITI-EMS Frontend Architecture Documentation

> **Student & Event Management System** — Complete frontend specification for AI-assisted code generation.
>
> Backend: NestJS v11 | PostgreSQL | TypeORM | Socket.IO
> All resource IDs are **UUID v4**.

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Dependencies & APIs](#2-dependencies--apis)
3. [Data Structures & State Management](#3-data-structures--state-management)
4. [UI Components](#4-ui-components)
5. [Routing & Navigation](#5-routing--navigation)
6. [Integration Notes](#6-integration-notes)
7. [Build & Deployment Instructions](#7-build--deployment-instructions)

---

## 1. Module Overview

The frontend is organized into **feature modules** that mirror the backend API resource groups.

| Module | Purpose | Key Pages / Views |
| --- | --- | --- |
| **Auth** | User login, session management, role-based access | Login, Logout, Profile |
| **Dashboard** | Landing page with summaries, quick actions | Home dashboard, stats cards |
| **Users** | CRUD for system users (admin/staff/security) | User list, create/edit form, detail view |
| **Companies** | Company registration, approval workflow | Company list, detail, approve/reject |
| **Tracks** | Academic track management | Track list, create/edit, student roster |
| **Students** | Student profiles, CV management, track assignment | Student list, profile, CV upload |
| **Events** | Event creation, venues, agendas | Event list, detail, calendar view |
| **Invitations** | Company invitation lifecycle | Invitation list, send, accept/reject |
| **Job Profiles** | Company job postings & approval | Job profile list, detail, approve |
| **Branding Speakers** | Speaker registration for branding days | Speaker list, create/edit |
| **Interview Queues** | Real-time queue management | Queue board, status updates |
| **Interviews** | Interview execution & results | Interview form, results entry |
| **Shared** | Reusable UI components, pipes, guards, interceptors | — |

### Role-Based Module Access

| Role | Accessible Modules |
| --- | --- |
| `admin` | All modules |
| `staff` | Users, Tracks, Students, Events, Invitations, Job Profiles, Branding Speakers, Queues, Interviews |
| `student` | Dashboard, Events, Job Profiles, Interview Queues (own), own CVs |
| `security` | Dashboard, Events (view-only) |
| `company_rep` | Dashboard, Events, Job Profiles (own), Invitations (own), Branding Speakers (own), Interviews |

---

## 2. Dependencies & APIs

### 2.1 Recommended Frontend Stack

```json
{
  "framework": "React 18+ with TypeScript",
  "build": "Vite",
  "routing": "React Router v6",
  "state": "Redux Toolkit + RTK Query (or TanStack Query)",
  "realtime": "socket.io-client",
  "ui": "Ant Design / Material-UI / shadcn-ui",
  "forms": "React Hook Form + Zod / class-validator",
  "http": "Axios",
  "date": "date-fns",
  "testing": "Vitest + React Testing Library"
}
```

### 2.2 Backend API Base URLs

| Environment | REST API | WebSocket Gateway |
| --- | --- | --- |
| Development | `http://localhost:3000` | `ws://localhost:3001` |
| Production | `${API_BASE_URL}` | `${WS_BASE_URL}` |
| Swagger Docs | `http://localhost:3000/api` | — |

### 2.3 External Dependencies

| Library | Purpose | Version |
| --- | --- | --- |
| `axios` | HTTP client with interceptors | ^1.7+ |
| `socket.io-client` | Real-time WebSocket communication | ^4.7+ |
| `@reduxjs/toolkit` | State management | ^2.0+ |
| `react-redux` | Redux bindings for React | ^9.0+ |
| `react-router-dom` | Client-side routing | ^6.22+ |
| `react-hook-form` | Form handling & validation | ^7.50+ |
| `zod` | Schema validation (optional, mirrors class-validator) | ^3.22+ |
| `date-fns` | Date formatting & manipulation | ^3.3+ |
| `uuid` | UUID generation for client-side IDs | ^9.0+ |
| `@tanstack/react-query` | Server state caching (optional alternative to RTK Query) | ^5.24+ |

### 2.4 Internal Module Dependency Graph

```
App
├── Auth Module
│   └── provides: auth context, JWT storage, role guard
├── Dashboard Module
│   ├── depends on: Users, Companies, Events, Queues (for stats)
├── Users Module
│   ├── depends on: Auth (role guard), Tracks (trackId), Companies (companyId)
├── Companies Module
│   └── depends on: Auth (admin/staff guard)
├── Tracks Module
│   ├── depends on: Auth (admin/staff guard)
│   └── provides: track list to Users, Students
├── Students Module
│   ├── depends on: Auth, Tracks, StudentCvs
├── Events Module
│   ├── depends on: Auth
│   └── provides: event list to Invitations, JobProfiles, BrandingSpeakers
├── Invitations Module
│   ├── depends on: Auth, Events, Companies
├── Job Profiles Module
│   ├── depends on: Auth, Events, Companies
├── Branding Speakers Module
│   ├── depends on: Auth, Events, Companies
├── Interview Queues Module
│   ├── depends on: Auth, Job Profiles, Students
│   └── connects to: WebSocket Gateway (real-time)
├── Interviews Module
│   ├── depends on: Auth, Interview Queues
│   └── connects to: WebSocket Gateway (real-time)
└── Shared Module
    ├── HTTP interceptor (auth headers, error handling)
    ├── WebSocket service (connection, reconnection, room management)
    ├── Role guard (route protection)
    ├── Validation utilities
    └── Reusable UI components
```

---

## 3. Data Structures & State Management

### 3.1 State Management Approach

**Recommended:** Redux Toolkit with RTK Query for server-state management.

```
store/
├── index.ts                 # Store configuration
├── api/                     # RTK Query API slices
│   ├── baseApi.ts           # Base query with axios/axios config
│   ├── usersApi.ts
│   ├── companiesApi.ts
│   ├── tracksApi.ts
│   ├── studentsApi.ts
│   ├── eventsApi.ts
│   ├── invitationsApi.ts
│   ├── jobProfilesApi.ts
│   ├── brandingSpeakersApi.ts
│   ├── queuesApi.ts
│   └── interviewsApi.ts
├── auth/
│   ├── authSlice.ts         # Auth state (user, token, role)
│   └── authApi.ts
└── ui/
    └── uiSlice.ts           # Sidebar, modal, toast state
```

### 3.2 Redux Store Shape

```typescript
interface RootState {
  auth: {
    user: User | null;
    token: string | null; // null until auth is implemented
    isAuthenticated: boolean;
    role: UserRole | null;
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarOpen: boolean;
    activeModal: string | null;
    toasts: Toast[];
  };
  // RTK Query injected state automatically
}
```

### 3.3 Core Data Models (TypeScript Interfaces)

> These mirror the backend TypeORM entities. All IDs are `string` (UUID v4).

#### Enums

```typescript
// src/users/enums
enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  STUDENT = 'student',
  SECURITY = 'security',
  COMPANY_REP = 'company_rep',
}

enum CompanyStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

enum StudentStatus {
  CURRENT = 'current',
  ALUMNI = 'alumni',
}

// src/events/enums
enum EventType {
  INTERNAL = 'internal',
  EXTERNAL_HOSTED = 'external_hosted',
  JOB_FAIR = 'job_fair',
}

enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

enum AgendaItemType {
  SESSION = 'session',
  BREAK = 'break',
  BRANDING_DAY = 'branding_day',
}

// src/job-fair/enums
enum CompanyInvitationStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

enum InterviewType {
  HR = 'hr',
  TECHNICAL = 'technical',
  BOTH = 'both',
}

// src/interviews/enums
enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  SKIPPED = 'skipped',
  HALTED = 'halted',
  COMPLETED = 'completed',
}

enum InterviewResult {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  HIRED = 'hired',
}
```

#### Entity Interfaces

```typescript
// ---- Users ----
interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string; // unique
  password?: string; // write-only, never display
  role: UserRole;
  company: Company | null; // populated if company_rep
  student: Student | null; // populated if student
}

interface Company {
  id: string; // UUID
  companyName: string;
  location: string;
  description: string;
  status: CompanyStatus;
  users?: User[];
  invitations?: CompanyInvitation[];
  jobProfiles?: JobProfile[];
  brandingSpeakers?: BrandingSpeaker[];
}

interface Student {
  id: string; // UUID
  graduationYear: number | null;
  status: StudentStatus;
  track: Track; // always populated (eager)
  user: User | null;
  cvs?: StudentCv[];
  interviewQueues?: InterviewQueue[];
}

// ---- Tracks ----
interface Track {
  id: string; // UUID
  name: string;
  description: string;
  students?: Student[];
}

// ---- Student CVs ----
interface StudentCv {
  id: string; // UUID
  fileUrl: string;
  title: string;
  isPrimary: boolean;
  student: Student; // eager
}

// ---- Events ----
interface Event {
  id: string; // UUID
  title: string; // 3-255 chars
  eventType: EventType;
  status: EventStatus;
  startDate: string; // ISO date (date column → "YYYY-MM-DD")
  endDate: string; // ISO date, must be after startDate
  description: string; // 10-2000 chars
  venues?: EventVenue[]; // cascade
  agendas?: EventAgenda[]; // cascade
  invitations?: CompanyInvitation[];
  jobProfiles?: JobProfile[];
  brandingSpeakers?: BrandingSpeaker[];
}

interface EventVenue {
  id: string; // UUID
  venueName: string;
  capacity: number; // int, min 1
  event?: Event;
}

interface EventAgenda {
  id: string; // UUID
  agendaItemType: AgendaItemType;
  startTime: string; // "HH:mm" (24h)
  endTime: string; // "HH:mm" (24h)
  details: string; // min 5 chars
  event?: Event;
}

// ---- Company Invitations ----
interface CompanyInvitation {
  id: string; // UUID
  invitationToken: string; // unique, used for accept/reject links
  status: CompanyInvitationStatus;
  createdAt: string; // ISO datetime
  company: Company; // eager
  event: Event; // eager
}

// ---- Job Profiles ----
interface JobProfile {
  id: string; // UUID
  jobTitle: string;
  jobDescription: string;
  requiredPositions: number; // int
  interviewType: InterviewType;
  isApproved: boolean; // default: false
  company: Company;
  event: Event;
  interviewQueues?: InterviewQueue[];
}

// ---- Branding Speakers ----
interface BrandingSpeaker {
  id: string; // UUID
  speakerName: string;
  speakerTitle: string;
  sessionDetails: string;
  company: Company;
  event: Event;
}

// ---- Interview Queues ----
interface InterviewQueue {
  id: string; // UUID
  position: number; // int
  status: QueueStatus;
  createdAt: string; // ISO datetime
  jobProfile: JobProfile;
  student: Student;
  interview?: Interview | null;
}

// ---- Interviews ----
interface Interview {
  id: string; // UUID
  interviewerName: string;
  startedAt: string | null; // ISO datetime
  endedAt: string | null; // ISO datetime
  result: InterviewResult;
  notes: string | null; // text
  queue: InterviewQueue;
}

// ---- JobFair (stub module) ----
// Currently returns placeholder data. Entity is empty.
// Skip frontend implementation until backend is complete.
```

### 3.4 DTO (Request Body) Interfaces

```typescript
// ---- Users ----
interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // min 6 chars
  role?: UserRole; // default: student
  companyId?: string; // required if role === company_rep
  trackId: string; // required if role === student
  graduationYear?: number;
}

interface UpdateUserDto extends Partial<CreateUserDto> {
  role?: UserRole;
  trackId?: string;
}

// ---- Companies ----
interface CreateCompanyDto {
  companyName: string;
  location: string;
  description: string;
  status?: CompanyStatus; // default: pending
}

interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}

// ---- Tracks ----
interface CreateTrackDto {
  name: string;
  description: string;
}

interface UpdateTrackDto extends Partial<CreateTrackDto> {}

// ---- Student CVs ----
interface CreateStudentCvDto {
  // TODO: Backend DTO is empty. Entity expects: fileUrl, title, isPrimary, studentId
  fileUrl: string;
  title: string;
  isPrimary?: boolean;
  studentId: string;
}

interface UpdateStudentCvDto extends Partial<CreateStudentCvDto> {}

// ---- Events ----
interface CreateEventDto {
  title: string; // 3-255 chars
  eventType: EventType;
  status: EventStatus;
  description: string; // 10-2000 chars
  startDate: string; // ISO date string
  endDate: string; // ISO date string, must be after startDate
  venues?: CreateVenueDto[];
  agendas?: CreateAgendaDto[];
}

interface CreateVenueDto {
  venueName: string;
  capacity: number; // min 1
}

interface CreateAgendaDto {
  itemType: AgendaItemType;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  details: string; // min 5 chars
}

interface UpdateEventDto extends Partial<CreateEventDto> {}

// ---- Invitations ----
interface CreateCompanyInvitationDto {
  companyId: string; // UUID
  eventId: string; // UUID
}

interface UpdateCompanyInvitationDto extends Partial<CreateCompanyInvitationDto> {
  status?: CompanyInvitationStatus;
}

// ---- Job Profiles ----
interface CreateJobProfileDto {
  jobTitle: string;
  jobDescription: string;
  requiredPositions: number;
  interviewType: InterviewType;
  companyId: string; // UUID
  eventId: string; // UUID
}

interface UpdateJobProfileDto extends Partial<CreateJobProfileDto> {}

// ---- Branding Speakers ----
interface CreateBrandingSpeakerDto {
  speakerName: string;
  speakerTitle: string;
  sessionDetails: string;
  companyId: string; // UUID (validated exists)
  eventId: string; // UUID (validated exists)
}

interface UpdateBrandingSpeakerDto extends Partial<CreateBrandingSpeakerDto> {}

// ---- Interview Queues ----
interface CreateQueueEntryDto {
  jobProfileId: string; // UUID
  studentId: string; // UUID
}

interface UpdateQueueStatusDto {
  status: QueueStatus;
}

// ---- Interviews ----
interface CreateInterviewDto {
  queueId: string; // UUID
  interviewerName: string;
}

interface UpdateInterviewDto {
  result?: InterviewResult;
  notes?: string;
}
```

---

## 4. UI Components

### 4.1 Reusable Component Library

#### Layout Components

| Component | Props | Description |
| --- | --- | --- |
| `AppLayout` | `{ children: ReactNode }` | Main layout with sidebar, header, content area |
| `Sidebar` | `{ items: NavItem[]; collapsed?: boolean }` | Navigation sidebar with role-based menu items |
| `Header` | `{ user: User; onLogout: () => void }` | Top bar with user info, notifications |
| `PageHeader` | `{ title: string; subtitle?: string; actions?: ReactNode[] }` | Page title section with action buttons |
| `ContentCard` | `{ title?: string; children: ReactNode; className?: string }` | Card wrapper for page content |

#### Data Display Components

| Component | Props | Description |
| --- | --- | --- |
| `DataTable<T>` | `{ columns: ColumnDef<T>[]; data: T[]; loading?: boolean; onRowClick?: (row: T) => void }` | Generic data table with sorting, pagination |
| `StatusBadge` | `{ status: string; variant?: 'default' | 'success' | 'warning' | 'error' }` | Color-coded status badge |
| `EnumTag` | `{ value: string; enumMap: Record<string, { label: string; color: string }> }` | Renders enum values as styled tags |
| `EmptyState` | `{ icon?: ReactNode; title: string; description?: string; action?: ReactNode }` | Empty list placeholder |
| `DetailPanel` | `{ items: { label: string; value: ReactNode }[] }` | Key-value detail display |

#### Form Components

| Component | Props | Description |
| --- | --- | --- |
| `FormInput` | `{ name: string; label: string; type?: string; placeholder?: string; rules?: RegisterOptions }` | Standard text input with validation |
| `FormSelect<T>` | `{ name: string; label: string; options: { value: T; label: string }[]; placeholder?: string }` | Select dropdown |
| `FormDatePicker` | `{ name: string; label: string; format?: string }` | Date picker input |
| `FormTimePicker` | `{ name: string; label: string }` | Time picker (HH:mm format) |
| `FormTextarea` | `{ name: string; label: string; rows?: number; maxLength?: number }` | Multi-line text input |
| `FormFileUpload` | `{ name: string; label: string; accept?: string; maxSize?: number }` | File upload with preview |
| `NestedFormList<T>` | `{ name: string; render: (index: number) => ReactNode; onAdd: () => void; onRemove: (index: number) => void }` | Dynamic list of nested forms (for venues/agendas) |

#### Feedback Components

| Component | Props | Description |
| --- | --- | --- |
| `LoadingSpinner` | `{ size?: 'sm' | 'md' | 'lg'; fullScreen?: boolean }` | Loading indicator |
| `ErrorBoundary` | `{ fallback?: ReactNode }` | Error boundary with retry |
| `ConfirmDialog` | `{ open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }` | Confirmation modal |
| `Toast` | `{ message: string; type: 'success' | 'error' | 'info' | 'warning'; onClose: () => void }` | Toast notification |

### 4.2 Styling Guidelines

```css
/* Design Tokens */
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

**Status Color Mapping:**

| Status | Color | Usage |
| --- | --- | --- |
| `approved`, `published`, `passed`, `hired`, `accepted`, `completed` | Green (`#22c55e`) | Positive/completed |
| `pending`, `draft`, `waiting` | Yellow (`#f59e0b`) | Pending/waiting |
| `rejected`, `failed`, `skipped`, `halted` | Red (`#ef4444`) | Negative/error |
| `in_progress` | Blue (`#3b82f6`) | Active/in progress |
| `archived`, `alumni` | Gray (`#64748b`) | Inactive/archived |

---

## 5. Routing & Navigation

### 5.1 Route Hierarchy

```
/                          → Dashboard (role-based landing)
/login                     → Login page (public)

/users                     → User list (admin, staff)
/users/new                 → Create user
/users/:id                 → User detail / edit
/users/email/:email        → (handled via API, not a route)

/companies                 → Company list (admin, staff)
/companies/new             → Register company
/companies/:id             → Company detail / edit
/companies/:id/approve     → (action, redirects back)

/tracks                    → Track list (admin, staff)
/tracks/new                → Create track
/tracks/:id                → Track detail (with students)
/tracks/:id/students       → Student roster for track

/students                  → Student list (admin, staff)
/students/:id              → Student profile
/students/:id/cvs          → Student CV management

/events                    → Event list (all authenticated users)
/events/new                → Create event (admin, staff)
/events/:id                → Event detail (with venues, agendas, invitations)
/events/:id/edit           → Edit event

/invitations               → Invitation list (admin, staff)
/invitations/new           → Send invitation
/invitations/:id           → Invitation detail
/invitations/accept/:token → Accept invitation (public link)
/invitations/reject/:token → Reject invitation (public link)

/job-profiles              → Job profile list (role-filtered)
/job-profiles/new          → Create job profile
/job-profiles/:id          → Job profile detail
/job-profiles/:id/approve  → (action, redirects back)

/branding-speakers         → Speaker list (role-filtered)
/branding-speakers/new     → Register speaker
/branding-speakers/:id     → Speaker detail

/queues                    → Queue board (real-time)
/queues/job-profile/:id    → Queue for specific job profile
/queues/job-profile/:id/next → (action, get next student)

/interviews                → Interview list (company_rep)
/interviews/:id            → Interview detail / results
/interviews/new            → Start interview (from queue)

/profile                   → Current user profile / settings
/settings                  → System settings (admin)

*                          → 404 Not Found
```

### 5.2 Route Configuration (React Router Example)

```typescript
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { RoleGuard } from '../guards/RoleGuard';
import { UserRole } from '../types/enums';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'users',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <UserListPage /> },
          { path: 'new', element: <UserFormPage /> },
          { path: ':id', element: <UserDetailPage /> },
        ],
      },
      {
        path: 'companies',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <CompanyListPage /> },
          { path: 'new', element: <CompanyFormPage /> },
          { path: ':id', element: <CompanyDetailPage /> },
        ],
      },
      {
        path: 'tracks',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true, element: <TrackListPage /> },
          { path: 'new', element: <TrackFormPage /> },
          { path: ':id', element: <TrackDetailPage /> },
        ],
      },
      {
        path: 'events',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <EventListPage /> },
          {
            path: 'new',
            element: (
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
                <EventFormPage />
              </RoleGuard>
            ),
          },
          { path: ':id', element: <EventDetailPage /> },
        ],
      },
      {
        path: 'queues',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <QueueBoardPage /> },
          { path: 'job-profile/:id', element: <QueueBoardPage /> },
        ],
      },
      {
        path: 'interviews',
        element: <RoleGuard allowedRoles={[UserRole.COMPANY_REP]} />,
        children: [
          { index: true, element: <InterviewListPage /> },
          { path: ':id', element: <InterviewDetailPage /> },
        ],
      },
      // ... more routes
    ],
  },
  {
    path: 'invitations/accept/:token',
    element: <AcceptInvitationPage />, // public
  },
  {
    path: 'invitations/reject/:token',
    element: <RejectInvitationPage />, // public
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

### 5.3 Authentication / Authorization

**Current Backend State:** No authentication middleware or guards are implemented. All endpoints are publicly accessible.

**Recommended Frontend Approach:**

1. **Implement JWT-based auth** (coordinate with backend team to add auth endpoints):

   - `POST /auth/login` → returns `{ user: User, token: string }`
   - `GET /auth/me` → returns current user
   - `POST /auth/logout` → invalidates session

2. **Store token** in `localStorage` or `httpOnly` cookie (cookie preferred for security).

3. **Role-based route protection** via `RoleGuard` component:
   ```tsx
   // src/guards/RoleGuard.tsx
   interface RoleGuardProps {
     allowedRoles: UserRole[];
     children: ReactNode;
     fallback?: ReactNode;
   }

   export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
     const { user } = useAuth();
     if (!user || !allowedRoles.includes(user.role)) {
       return fallback ?? <Navigate to="/unauthorized" replace />;
     }
     return <>{children}</>;
   }
   ```

4. **Public routes:** Invitation accept/reject links (`/invitations/accept/:token`, `/invitations/reject/:token`) must remain accessible without login.

---

## 6. Integration Notes

### 6.1 HTTP Client Configuration

```typescript
// src/api/client.ts
import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

### 6.2 WebSocket / Real-Time Integration

```typescript
// src/services/socket.service.ts
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ---- Global queue events ----
  onQueueJoined(callback: (data: InterviewQueue) => void) {
    this.socket?.on('queueJoined', callback);
  }

  onQueueUpdated(callback: (data: InterviewQueue) => void) {
    this.socket?.on('queueUpdated', callback);
  }

  onInterviewStarted(callback: (data: Interview) => void) {
    this.socket?.on('interviewStarted', callback);
  }

  onInterviewEnded(callback: (data: Interview) => void) {
    this.socket?.on('interviewEnded', callback);
  }

  // ----Room-based events (per job profile) ----
  joinJobProfileRoom(jobProfileId: string) {
    this.socket?.emit('joinJobProfileRoom', {
      clientId: this.socket?.id,
      jobProfileId,
    });
  }

  leaveJobProfileRoom(jobProfileId: string) {
    this.socket?.emit('leaveJobProfileRoom', {
      clientId: this.socket?.id,
      jobProfileId,
    });
  }

  off(event: string) {
    this.socket?.off(event);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
```

**WebSocket Events Summary:**

| Event | Direction | Payload | When Emitted |
| --- | --- | --- | --- |
| `queueJoined` | Server → Client | `InterviewQueue` | Student joins interview queue |
| `queueUpdated` | Server → Client | `InterviewQueue` | Queue status changes |
| `interviewStarted` | Server → Client | `Interview` | Interview begins |
| `interviewEnded` | Server → Client | `Interview` | Interview ends with result |

### 6.3 API Endpoint Reference

#### Users (`/users`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/users` | — | `CreateUserDto` | `User` (201) |
| `GET` | `/users` | — | — | `User[]` (200) |
| `GET` | `/users/:id` | — | — | `User` (200) |
| `GET` | `/users/email/:email` | — | — | `User` (200) |
| `PATCH` | `/users/:id` | — | `UpdateUserDto` | `User` (200) |
| `DELETE` | `/users/:id` | — | — | `User` (200) |

#### Companies (`/companies`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/companies` | — | `CreateCompanyDto` | `Company` (201) |
| `GET` | `/companies` | `status?` | — | `Company[]` (200) |
| `GET` | `/companies/:id` | — | — | `Company` (200) |
| `PATCH` | `/companies/:id` | — | `UpdateCompanyDto` | `Company` (200) |
| `PATCH` | `/companies/:id/approve` | — | — | `Company` (200) |
| `PATCH` | `/companies/:id/reject` | — | — | `Company` (200) |
| `DELETE` | `/companies/:id` | — | — | `Company` (200) |

#### Tracks (`/tracks`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/tracks` | — | `CreateTrackDto` | `Track` (201) |
| `GET` | `/tracks` | — | — | `Track[]` (200) |
| `GET` | `/tracks/:id` | — | — | `Track` (200) |
| `PATCH` | `/tracks/:id` | — | `UpdateTrackDto` | `Track` (200) |
| `DELETE` | `/tracks/:id` | — | — | `Track` (200) |
| `GET` | `/tracks/:id/students` | — | — | `Student[]` (200) |

#### Student CVs (`/student-cvs`) — STUB

> ⚠️ Backend is a stub. DTOs are empty, service returns placeholder strings. Entity is well-defined but CRUD is not wired up. Implement frontend UI but expect API changes.

| Method | Path | Request Body | Response |
| --- | --- | --- | --- |
| `POST` | `/student-cvs` | `CreateStudentCvDto` | — |
| `GET` | `/student-cvs` | — | — |
| `GET` | `/student-cvs/:id` | — | — |
| `PATCH` | `/student-cvs/:id` | `UpdateStudentCvDto` | — |
| `DELETE` | `/student-cvs/:id` | — | — |

#### Events (`/events`)

| Method | Path | Request Body | Response |
| --- | --- | --- | --- |
| `POST` | `/events` | `CreateEventDto` | `Event` (201) |
| `GET` | `/events` | — | `Event[]` (200) |
| `GET` | `/events/:id` | — | `Event` (200) |
| `PATCH` | `/events/:id` | `UpdateEventDto` | `Event` (200) |
| `DELETE` | `/events/:id` | — | `Event` (200) |

#### Invitations (`/invitations`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/invitations` | — | `CreateCompanyInvitationDto` | `CompanyInvitation` (201) |
| `GET` | `/invitations` | `eventId?` | — | `CompanyInvitation[]` (200) |
| `GET` | `/invitations/token/:token` | — | — | `CompanyInvitation` (200) |
| `GET` | `/invitations/:id` | — | — | `CompanyInvitation` (200) |
| `PATCH` | `/invitations/:id` | — | `UpdateCompanyInvitationDto` | `CompanyInvitation` (200) |
| `POST` | `/invitations/accept/:token` | — | — | `CompanyInvitation` (200) |
| `POST` | `/invitations/reject/:token` | — | — | `CompanyInvitation` (200) |
| `DELETE` | `/invitations/:id` | — | — | `CompanyInvitation` (200) |

#### Job Profiles (`/job-profiles`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/job-profiles` | — | `CreateJobProfileDto` | `JobProfile` (201) |
| `GET` | `/job-profiles` | `eventId?`, `companyId?` | — | `JobProfile[]` (200) |
| `GET` | `/job-profiles/:id` | — | — | `JobProfile` (200) |
| `PATCH` | `/job-profiles/:id` | — | `UpdateJobProfileDto` | `JobProfile` (200) |
| `PATCH` | `/job-profiles/:id/approve` | — | — | `JobProfile` (200) |
| `DELETE` | `/job-profiles/:id` | — | — | `JobProfile` (200) |

#### Branding Speakers (`/branding-speakers`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/branding-speakers` | — | `CreateBrandingSpeakerDto` | `BrandingSpeaker` (201) |
| `GET` | `/branding-speakers` | `eventId?`, `companyId?` | — | `BrandingSpeaker[]` (200) |
| `GET` | `/branding-speakers/:id` | — | — | `BrandingSpeaker` (200) |
| `PATCH` | `/branding-speakers/:id` | — | `UpdateBrandingSpeakerDto` | `BrandingSpeaker` (200) |
| `DELETE` | `/branding-speakers/:id` | — | — | `BrandingSpeaker` (200) |

#### Interview Queues (`/queues`)

| Method | Path | Query Params | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/queues` | — | `CreateQueueEntryDto` | `InterviewQueue` (201) |
| `GET` | `/queues` | `jobProfileId?`, `studentId?` | — | `InterviewQueue[]` (200) |
| `GET` | `/queues/job-profile/:id/next` | — | — | `InterviewQueue` (200) |
| `GET` | `/queues/:id` | — | — | `InterviewQueue` (200) |
| `PATCH` | `/queues/:id/status` | — | `UpdateQueueStatusDto` | `InterviewQueue` (200) |
| `DELETE` | `/queues/:id` | — | — | `InterviewQueue` (200) |

#### Interviews (`/interviews`)

| Method | Path | Request Body | Response |
| --- | --- | --- | --- |
| `POST` | `/interviews` | `CreateInterviewDto` | `Interview` (201) |
| `GET` | `/interviews` | — | `Interview[]` (200) |
| `GET` | `/interviews/:id` | — | `Interview` (200) |
| `PATCH` | `/interviews/:id` | `UpdateInterviewDto` | `Interview` (200) |

#### Job Fair (`/job-fair`) — STUB

> ⚠️ Stub module. Empty DTOs, empty `JobFair` entity, placeholder service. Skip frontend implementation until backend is complete.

| Method | Path | Request Body | Response |
| --- | --- | --- | --- |
| `POST` | `/job-fair` | `CreateJobFairDto` | — |
| `GET` | `/job-fair` | — | — |
| `GET` | `/job-fair/:id` | — | — |
| `PATCH` | `/job-fair/:id` | `UpdateJobFairDto` | — |
| `DELETE` | `/job-fair/:id` | — | — |

### 6.4 Error Response Shape

The backend returns validation errors in this format:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

Frontend should map `message[]` to form field errors.

### 6.5 Security Considerations

| Concern | Current State | Recommended Action |
| --- | --- | --- |
| **Authentication** | None implemented | Add JWT-based auth (OAuth2 / JWT) on backend; store tokens in memory or HTTP-only cookies |
| **CSRF** | No CSRF protection | If using cookie-based auth, implement CSRF tokens |
| **XSS** | — | Sanitize all user-generated content; use React's built-in escaping; avoid `dangerouslySetInnerHTML` |
| **CORS** | Default NestJS CORS | Configure explicit `origin` whitelist in production |
| **Role Enforcement** | No guards | Add `@UseGuards(JwtAuthGuard, RolesGuard)` on all backend controllers |
| **Password Exposure** | Passwords are hashed (bcrypt) on backend | Never display password fields in UI; use separate change-password endpoint |
| **Token Storage** | N/A | Do NOT store JWT in localStorage. Use `sessionStorage` or in-memory Zustand store. |
| **WebSocket Auth** | Open (`cors: { origin: '*' }`) | Add Socket.IO auth middleware; verify JWT on connection |

---

## 7. Build & Deployment Instructions

### 7.1 Project Scaffolding

```bash
# Create Vite + React + TypeScript project
npm create vite@latest iti-ems-frontend -- --template react-ts
cd iti-ems-frontend

# Install dependencies
npm install axios socket.io-client @tanstack/react-query zustand react-router-dom dayjs
npm install react-hook-form @hookform/resolvers zod
npm install antd @ant-design/icons          # or: @mui/material @emotion/react

# Install dev dependencies
npm install -D @types/node eslint prettier
```

### 7.2 Environment Variables

Create `.env` files in the project root:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=ITI-EMS
VITE_APP_ENV=development
```

```env
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com
VITE_APP_NAME=ITI-EMS
VITE_APP_ENV=production
```

**Access in code:**

```ts
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
```

### 7.3 Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (default: `http://localhost:5173`) |
| `npm run build` | Production build → outputs to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | `tsc --noEmit` — type check without building |
| `npm run format` | `prettier --write "src/**/*.{ts,tsx,css,json}"` |
| `npm run test` | Run unit tests (Vitest / Jest) |
| `npm run test:watch` | Watch mode for tests |

### 7.4 Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['antd', '@ant-design/icons'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

### 7.5 Recommended Folder Structure

```
src/
├── api/                    # Axios client, API functions per resource
│   ├── client.ts
│   ├── users.api.ts
│   ├── companies.api.ts
│   ├── tracks.api.ts
│   ├── events.api.ts
│   ├── invitations.api.ts
│   ├── jobProfiles.api.ts
│   ├── brandingSpeakers.api.ts
│   ├── queues.api.ts
│   └── interviews.api.ts
├── components/             # Reusable UI components
│   ├── layout/
│   ├── data-display/
│   ├── forms/
│   └── feedback/
├── hooks/                  # Custom hooks (useWebSocket, useDebounce, etc.)
├── pages/                  # Route-level page components
│   ├── Dashboard/
│   ├── Users/
│   ├── Tracks/
│   ├── Students/
│   ├── Events/
│   ├── Companies/
│   ├── JobFair/
│   ├── Interviews/
│   └── Auth/
├── routes/                 # Route definitions, guards
│   ├── index.tsx
│   └── RequireRole.tsx
├── services/               # Singleton services
│   └── socket.service.ts
├── store/                  # Zustand stores
│   └── uiStore.ts
├── types/                  # TypeScript interfaces & enums
│   └── index.ts
├── utils/                  # Pure utility functions
│   ├── formatDate.ts
│   └── validationSchemas.ts
├── App.tsx
└── main.tsx
```

### 7.6 Deployment

**Static Hosting (Vercel, Netlify, Cloudflare Pages):**

```bash
npm run build
# Upload dist/ folder
```

**Docker (if self-hosting):**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx config for SPA routing:**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Appendix A: Backend Enum Reference (for frontend Zod schemas)

```typescript
// Mirror these exactly in your frontend validation schemas

UserRole: 'admin' | 'staff' | 'student' | 'security' | 'company_rep'
CompanyStatus: 'approved' | 'pending' | 'rejected'
StudentStatus: 'current' | 'alumni'
EventType: 'internal' | 'external_hosted' | 'job_fair'
EventStatus: 'draft' | 'published' | 'archived'
AgendaItemType: 'session' | 'break' | 'branding_day'
CompanyInvitationStatus: 'accepted' | 'rejected' | 'pending'
InterviewType: 'hr' | 'technical' | 'both'
QueueStatus: 'waiting' | 'in_progress' | 'skipped' | 'halted' | 'completed'
InterviewResult: 'pending' | 'passed' | 'failed' | 'hired'
```

## Appendix B: DTO Validation Rules (Backend → Frontend Zod Mapping)

| DTO Field | Rule | Zod Equivalent |
| --- | --- | --- |
| `CreateUserDto.email` | Valid email, required | `z.string().email()` |
| `CreateUserDto.password` | Min 6 chars, required | `z.string().min(6)` |
| `CreateUserDto.firstName` | Non-empty string | `z.string().min(1)` |
| `CreateUserDto.lastName` | Non-empty string | `z.string().min(1)` |
| `CreateUserDto.role` | Enum (optional, default: student) | `z.nativeEnum(UserRole).optional()` |
| `CreateUserDto.companyId` | UUID, required if company_rep | `z.string().uuid().optional()` |
| `CreateUserDto.trackId` | UUID, required for student | `z.string().uuid()` |
| `CreateUserDto.graduationYear` | Number, optional | `z.number().int().optional()` |
| `CreateCompanyDto.companyName` | Non-empty string | `z.string().min(1)` |
| `CreateCompanyDto.location` | Non-empty string | `z.string().min(1)` |
| `CreateCompanyDto.description` | Non-empty string | `z.string().min(1)` |
| `CreateTrackDto.name` | Non-empty string | `z.string().min(1)` |
| `CreateTrackDto.description` | Non-empty string | `z.string().min(1)` |
| `CreateEventDto.title` | 3-255 chars | `z.string().min(3).max(255)` |
| `CreateEventDto.description` | 10-2000 chars | `z.string().min(10).max(2000)` |
| `CreateEventDto.startDate` | ISO date string | `z.string().datetime()` |
| `CreateEventDto.endDate` | ISO date, after startDate | `z.string().datetime()` + custom refine |
| `CreateVenueDto.venueName` | Non-empty string | `z.string().min(1)` |
| `CreateVenueDto.capacity` | Int, min 1 | `z.number().int().min(1)` |
| `CreateAgendaDto.itemType` | Enum | `z.nativeEnum(AgendaItemType)` |
| `CreateAgendaDto.startTime` | HH:mm format | `z.string().regex(/^([01]\d\|2[0-3]):?([0-5]\d)$/)` |
| `CreateAgendaDto.endTime` | HH:mm format | `z.string().regex(/^([01]\d\|2[0-3]):?([0-5]\d)$/)` |
| `CreateAgendaDto.details` | Min 5 chars | `z.string().min(5)` |
| `CreateCompanyInvitationDto.companyId` | UUID | `z.string().uuid()` |
| `CreateCompanyInvitationDto.eventId` | UUID | `z.string().uuid()` |
| `CreateJobProfileDto.jobTitle` | Non-empty string | `z.string().min(1)` |
| `CreateJobProfileDto.jobDescription` | Non-empty string | `z.string().min(1)` |
| `CreateJobProfileDto.requiredPositions` | Int | `z.number().int()` |
| `CreateJobProfileDto.interviewType` | Enum | `z.nativeEnum(InterviewType)` |
| `CreateJobProfileDto.companyId` | UUID | `z.string().uuid()` |
| `CreateJobProfileDto.eventId` | UUID | `z.string().uuid()` |
| `CreateBrandingSpeakerDto.speakerName` | Non-empty string | `z.string().min(1)` |
| `CreateBrandingSpeakerDto.speakerTitle` | Non-empty string | `z.string().min(1)` |
| `CreateBrandingSpeakerDto.sessionDetails` | Non-empty string | `z.string().min(1)` |
| `CreateBrandingSpeakerDto.companyId` | UUID (exists check) | `z.string().uuid()` |
| `CreateBrandingSpeakerDto.eventId` | UUID (exists check) | `z.string().uuid()` |
| `CreateQueueEntryDto.jobProfileId` | UUID | `z.string().uuid()` |
| `CreateQueueEntryDto.studentId` | UUID | `z.string().uuid()` |
| `UpdateQueueStatusDto.status` | Enum | `z.nativeEnum(QueueStatus)` |
| `CreateInterviewDto.queueId` | UUID | `z.string().uuid()` |
| `CreateInterviewDto.interviewerName` | Non-empty string | `z.string().min(1)` |
| `UpdateInterviewDto.result` | Enum (optional) | `z.nativeEnum(InterviewResult).optional()` |
| `UpdateInterviewDto.notes` | String (optional) | `z.string().optional()` |

## Appendix C: Backend Server-Side Behaviors to Know

| Behavior | Detail |
| --- | --- |
| **User creation with role=student** | Auto-creates a `Student` entity linked to the user and the provided `trackId`. |
| **User creation with role=company_rep** | Validates that `companyId` is provided and valid. |
| **Company approve/reject** | `PATCH /companies/:id/approve` sets status to `approved`. `PATCH /companies/:id/reject` sets status to `rejected`. |
| **Invitation accept/reject** | `POST /invitations/accept/:token` sets status to `accepted`. `POST /invitations/reject/:token` sets status to `rejected`. |
| **Job profile approve** | `PATCH /job-profiles/:id/approve` sets `isApproved = true`. |
| **Queue next student** | `GET /queues/job-profile/:id/next` returns the first student with status `waiting`. |
| **Interview creation** | `POST /interviews` with `queueId` sets the queue status to `in_progress` and emits `interviewStarted` via WebSocket. |
| **Interview update with result** | `PATCH /interviews/:id` with `result` sets the queue status to `completed` and emits `interviewEnded` via WebSocket. |
| **Queue join** | `POST /queues` emits `queueJoined` via WebSocket. |
| **Queue status update** | `PATCH /queues/:id/status` emits `queueUpdated` via WebSocket. |
| **Nested event creation** | `POST /events` accepts `venues[]` and `agendas[]` in the same payload (cascade save). |

## Appendix D: WebSocket Gateway Details

```typescript
// Backend gateway config (for reference)
@WebSocketGateway(3001, {
  cors: { origin: '*' },
})
```

**Lifecycle methods available on the gateway:**

| Method | Purpose |
| --- | --- |
| `emitQueueJoined(queueEntry)` | Broadcasts to all clients |
| `emitQueueUpdated(queueEntry)` | Broadcasts to all clients |
| `emitInterviewStarted(interview)` | Broadcasts to all clients |
| `emitInterviewEnded(interview)` | Broadcasts to all clients |
| `emitToJobProfile(jobProfileId, event, data)` | Emits to room `job-profile:<id>` |
| `joinJobProfileRoom(clientId, jobProfileId)` | Adds client to room |

**Frontend should:**

1. Connect on app mount.
2. Subscribe to the 4 global events at the queue board page level.
3. Use `joinJobProfileRoom` when viewing a specific job profile's queue.
4. Disconnect on unmount to avoid memory leaks.

---

> **End of Document** — This file contains all the information an AI agent or developer needs to scaffold and build the complete ITI-EMS frontend.