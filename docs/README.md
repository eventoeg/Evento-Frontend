# ITI EMS Frontend - Module Implementation Index

> Complete detailed implementation guides for all frontend modules in the ITI Event Management System.

---

## Module Documentation

| # | Module | Documentation | Status |
|---|--------|---------------|--------|
| 1 | **Authentication & Identity** | [01-auth-module.md](./01-auth-module.md) | ✅ Ready to Build |
| 2 | **Dashboard** | [02-dashboard-module.md](./02-dashboard-module.md) | ✅ Ready to Build |
| 3 | **Users Management** | [03-users-module.md](./03-users-module.md) | ✅ Ready to Build |
| 4 | **Companies** | [04-companies-module.md](./04-companies-module.md) | ✅ Ready to Build |
| 5 | **Academic Tracks** | [05-tracks-module.md](./05-tracks-module.md) | ✅ Ready to Build |
| 6 | **Students** | [06-students-module.md](./06-students-module.md) | ✅ Ready to Build |
| 7 | **Events** | [07-events-module.md](./07-events-module.md) | ✅ Ready to Build |
| 8 | **Company Invitations** | [08-invitations-module.md](./08-invitations-module.md) | ✅ Ready to Build |
| 9 | **Job Profiles** | [09-job-profiles-module.md](./09-job-profiles-module.md) | ✅ Ready to Build |
| 10 | **Branding Speakers** | [10-branding-speakers-module.md](./10-branding-speakers-module.md) | ✅ Ready to Build |
| 11 | **Interview Queues** | [11-interview-queues-module.md](./11-interview-queues-module.md) | ✅ Ready to Build |
| 12 | **Interviews** | [12-interviews-module.md](./12-interviews-module.md) | ✅ Ready to Build |
| 13 | **Student CVs** | [13-student-cvs-module.md](./13-student-cvs-module.md) | ✅ Ready to Build |

---

## Source Documentation

These implementation guides are derived from:

- **API Documentation**: `API_DOCUMENTATION.md` - Complete API reference with endpoints, request/response shapes, and authentication
- **Frontend Architecture**: `Frontend-Arch.md` - Technical architecture with data models, state management, routing, and integration patterns
- **Requirements**: `Frontend_Requirements.md` - Project requirements with module overview and dependencies
- **Module Specifications**: `Frontend_modules_and_screens_specifications.md` - Exhaustive screen specifications with UI details

---

## Technology Stack

### Core Framework
- **React 18+** with TypeScript
- **Next.js** (App Router) - Framework and build tool
- **React Router** (if using SPA mode)

### State Management
- **Zustand** or **Redux Toolkit** - Global state (auth, UI)
- **React Query** (TanStack Query) - Server state management

### UI Components
- **Ant Design** or **Material-UI** - Component library
- **Tailwind CSS** or **Vanilla CSS** - Styling
- **Lucide React** - Icon library

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Real-Time Communication
- **Socket.IO Client** - WebSocket for live queue updates

### Utilities
- **Axios** - HTTP client with interceptors
- **Date-fns** - Date formatting
- **UUID** - Client-side ID generation

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── users/
│   │   ├── companies/
│   │   ├── tracks/
│   │   ├── students/
│   │   ├── events/
│   │   ├── invitations/
│   │   ├── job-profiles/
│   │   ├── branding-speakers/
│   │   ├── queues/
│   │   └── interviews/
│   ├── profile/
│   └── api/                  # API routes (if needed)
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components
│   ├── forms/                # Form components
│   ├── layout/               # Layout components
│   └── data-display/         # Data display components
├── lib/                      # Library configurations
│   ├── axios.ts
│   ├── socket.ts
│   └── utils.ts
├── services/                 # API service layer
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── companies.service.ts
│   └── ...
├── store/                    # State management
│   ├── auth.store.ts
│   └── ui.store.ts
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── useDebounce.ts
├── types/                    # TypeScript types
│   ├── enums.ts
│   ├── models.ts
│   └── dtos.ts
└── validations/              # Zod schemas
    ├── auth.schema.ts
    ├── users.schema.ts
    └── ...
```

---

## Implementation Phases

### Phase 1: Foundation & Authentication (Current)
- [x] Create module documentation
- [ ] Project scaffolding
- [ ] Auth state management
- [ ] HTTP client with interceptors
- [ ] Login page
- [ ] Registration page
- [ ] Profile page
- [ ] Route guards

### Phase 2: Core Management Modules
- [ ] Dashboard (role-based)
- [ ] Users CRUD
- [ ] Companies management
- [ ] Tracks management
- [ ] Students list & profiles

### Phase 3: Events & Job Fair
- [ ] Events CRUD with wizard
- [ ] Invitations workflow
- [ ] Job profiles
- [ ] Branding speakers

### Phase 4: Real-Time Features
- [ ] Interview queues
- [ ] WebSocket integration
- [ ] Interviews management
- [ ] Feedback forms

### Phase 5: Student Features
- [ ] CV upload & management
- [ ] Student queue dashboard
- [ ] Portfolio manager

---

## API Response Envelope

All API responses follow this standard envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  path: string;
  data: T | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  errors: string[] | null;
  timestamp: string;
}
```

---

## Authentication Flow

1. **Login**: `POST /auth/login` → Store tokens in memory/sessionStorage
2. **Register**: `POST /auth/register` → Auto-login after registration
3. **Refresh**: `POST /auth/refresh` → Refresh access token
4. **Profile**: `GET /auth/profile` → Get current user
5. **Logout**: Clear all auth state

### Token Storage
- **Access Token**: In-memory (Zustand store)
- **Refresh Token**: `sessionStorage` (cleared on tab close)
- **Never use localStorage** for tokens (security best practice)

---

## Role-Based Access Control

| Role | Access Level | Key Modules |
|------|-------------|-------------|
| `admin` | Full access | All modules |
| `staff` | Operational | Users, Events, Companies, Tracks, Students |
| `student` | Self-service | Dashboard, Events, Job Profiles, Queues (own), CVs |
| `security` | Read-only | Dashboard, Events (view) |
| `company_rep` | Company-specific | Job Profiles, Invitations, Interviews, Branding Speakers |

---

## Status Color Mapping

| Status | Color | Hex Code |
|--------|-------|----------|
| approved, published, passed, hired, accepted, completed | Green | `#22c55e` |
| pending, draft, waiting | Yellow | `#f59e0b` |
| rejected, failed, skipped, halted | Red | `#ef4444` |
| in_progress | Blue | `#3b82f6` |
| archived, alumni | Gray | `#64748b` |

---

## Quick Reference Links

- **Backend API Base**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **WebSocket Gateway**: `ws://localhost:3001`
- **Frontend Dev Server**: `http://localhost:5173`

---

## Next Steps

1. ✅ Complete all module documentation (DONE)
2. 🚀 Start building Auth module frontend screens (NEXT)
3. Implement login page
4. Implement registration page
5. Implement profile page
6. Set up route guards and authentication flow
7. Test end-to-end auth workflow

---

> **Last Updated**: April 11, 2026
> **Status**: All module docs created, ready to begin implementation
