# ITI EMS Frontend Project Documentation

This document provides a comprehensive technical overview of the **ITI Event Management System (EMS)** project modules, APIs, and data structures required for building the frontend.

---

## 1. Module Overview

| Module Name | Purpose | Key Responsibilities |
| :--- | :--- | :--- |
| **Authentication & Users** | User management & RBAC | Login, Registration, Profile management, Company approval. |
| **Events Management** | Event lifecycle | Creating events, managing venues, and scheduling agendas. |
| **Job Fair** | Job fair coordination | Handling company invitations, job profiles, and branding speakers. |
| **Interviews & Queues** | Real-time interview flow | Managing student queues for job interviews with live updates. |
| **Academic Tracks** | Curricular structure | Managing tracks (e.g., Fullstack, Cyber Security) students belong to. |
| **Student Portfolio** | Career development | Uploading and managing student CVs. |

---

## 2. Dependencies & APIs

### External Libraries
- **Framework**: React (Recommended) or Angular.
- **State Management**: Redux Toolkit (React) or NgRx (Angular).
- **Styling**: Vanilla CSS or Styled Components (Avoid Tailwind unless specified).
- **Communication**: 
  - `axios` or `fetch` for REST APIs.
  - `socket.io-client` for real-time queue updates.
- **Icons**: Lucide React or FontAwesome.
- **Forms**: React Hook Form with Yup/Zod validation.

### Internal API Base URL
`http://localhost:3000` (Default NestJS port)

### WebSocket Gateway
`ws://localhost:3001` (Queue updates)

---

## 3. Data Structures & State Management

### Key Enums

```typescript
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  STUDENT = 'student',
  SECURITY = 'security',
  COMPANY_REP = 'company_rep',
}

export enum CompanyStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export enum QueueStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  SKIPPED = 'skipped',
  HALTED = 'halted',
  COMPLETED = 'completed',
}

export enum InterviewResult {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  HIRED = 'hired',
}
```

### Core Data Models

#### User Profile
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  student?: Student;
  company?: Company;
}
```

#### Event
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'internal' | 'external_hosted' | 'job_fair';
  status: 'draft' | 'published' | 'archived';
  startDate: string; // ISO Date
  endDate: string;
  venues: Venue[];
  agendas: AgendaItem[];
}
```

---

## 4. UI Components

### Reusable Components
- **DataTable**: Searchable, paginated table for Users, Events, and Companies.
- **StatusBadge**: Color-coded indicators for `QueueStatus`, `CompanyStatus`, etc.
- **Modal**: Multi-purpose container for forms (Create Event, Edit User).
- **QueueCard**: Displays student information in the interview queue.
- **FileUploader**: For Student CVs (PDF support).

### Props & Styling
- Use **CSS Variables** for theme consistency (colors, spacing).
- Maintain 8px grid system.
- Components should be **Responsive** (Mobile-first).

---

## 5. Routing & Navigation

### Routes Hierarchy
- `/` - Landing/Login Page
- `/register` - User Registration (Student/Company Rep)
- `/dashboard` - Role-based landing page
- `/events` - Event listing
  - `/events/:id` - Event details
- `/companies` - (Admin) Company approval workflow
- `/job-fair`
  - `/job-fair/profiles` - Job profiles listing
  - `/job-fair/queue/:id` - **Live Queue View** (Job Profile specific)
- `/profile` - User settings & CV management

### Authorization
- **Public**: Login, Register.
- **Admin**: All modules, Company approvals.
- **Staff**: Events, Job Fair management.
- **Student**: Profile, CV upload, Joining queues.
- **Company Rep**: Job profile management, Starting interviews.

---

## 6. Integration Notes

### Real-time Interview Queue (WebSockets)
The frontend must listen to the following events from `QueueGateway`:
- `queueJoined`: Update local queue list when a student joins.
- `queueUpdated`: Update student status (e.g., from `WAITING` to `IN_PROGRESS`).
- `interviewStarted`: Show active interview UI for the interviewer.
- `interviewEnded`: Transition to feedback form.

### Security
- **JWT**: Store token in `localStorage` or HttpOnly cookie.
- **Interceptors**: Attach `Authorization: Bearer <token>` to every request.
- **Guards**: Frontend route guards based on `UserRole`.

---

## 7. Build & Deployment Instructions

### Local Setup
1. Clone the repository.
2. Install dependencies: `npm install` or `pnpm install`.
3. Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_WS_URL=http://localhost:3001
   ```
4. Start development server: `npm start`.

### Build
`npm run build` - Generates optimized production build in `dist/`.