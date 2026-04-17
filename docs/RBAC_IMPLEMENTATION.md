# Role-Based Access Control (RBAC) Implementation

## Overview
The ITI EMS frontend now includes a comprehensive RBAC system that controls access to routes and UI elements based on user roles.

## Roles
The system supports 5 roles (defined in `UserRole` enum):
- `ADMIN` - Full system access
- `STAFF` - Event moderation and user management assistance
- `STUDENT` - Profile, CVs, event joining, queues, feedback
- `SECURITY` - Check-in (attendance) only
- `COMPANY_REP` - Job profiles, CV viewing, interviewing, feedback

## Components

### 1. RoleGuard Component
**Location**: `src/components/RoleGuard.tsx`

The `RoleGuard` component protects routes and UI elements based on user roles and permissions.

#### Usage Examples:

```tsx
// Protect by specific role
<RoleGuard requiredRole={UserRole.ADMIN}>
  <AdminDashboard />
</RoleGuard>

// Protect by permission
<RoleGuard requiredPermission="MANAGE_COMPANIES">
  <CompanyManagementButton />
</RoleGuard>

// Protect by multiple permissions (any one required)
<RoleGuard requiredPermissions={["VIEW_COMPANIES", "MANAGE_COMPANIES"]}>
  <CompanySection />
</RoleGuard>

// Protect by multiple permissions (ALL required)
<RoleGuard 
  requiredPermissions={["VIEW_COMPANIES", "APPROVE_COMPANIES"]}
  requireAllPermissions={true}
>
  <CompanyApprovalPanel />
</RoleGuard>

// Custom fallback UI
<RoleGuard 
  requiredRole={UserRole.ADMIN}
  fallback={<div className="text-red-600">Access Denied</div>}
>
  <AdminPanel />
</RoleGuard>
```

### 2. AuthGuard Component (Enhanced)
**Location**: `src/components/AuthGuard.tsx`

The `AuthGuard` now supports role-based protection in addition to authentication checking.

#### Usage Examples:

```tsx
// Basic auth check (existing)
<AuthGuard>
  <DashboardPage />
</AuthGuard>

// Require admin role (legacy)
<AuthGuard requireAdmin={true}>
  <AdminPage />
</AuthGuard>

// Require specific role (new)
<AuthGuard requiredRole={UserRole.ADMIN}>
  <AdminPage />
</AuthGuard>

// Custom fallback
<AuthGuard 
  requiredRole={UserRole.ADMIN}
  fallback={<CustomAccessDenied />}
>
  <AdminPage />
</AuthGuard>
```

## Permission System

### Permission Keys
Defined in `ROLE_PERMISSIONS` map in `RoleGuard.tsx`:

```typescript
// Core navigation
VIEW_DASHBOARD, VIEW_PROFILE

// Company management
VIEW_COMPANIES, MANAGE_COMPANIES, APPROVE_COMPANIES

// Track management
VIEW_TRACKS, MANAGE_TRACKS

// Event management
VIEW_EVENTS, MANAGE_EVENTS, PUBLISH_EVENTS

// Job profiles
VIEW_JOB_PROFILES, MANAGE_JOB_PROFILES, APPROVE_JOB_PROFILES

// Interviews and queues
VIEW_INTERVIEWS, MANAGE_INTERVIEWS, CONDUCT_INTERVIEWS

// Student CVs
VIEW_STUDENT_CVS, MANAGE_STUDENT_CVS

// Attendance
VIEW_ATTENDANCE, MANAGE_ATTENDANCE

// Feedback
VIEW_FEEDBACK, MANAGE_FEEDBACK

// User management
VIEW_USERS, MANAGE_USERS

// Job Fair specific
VIEW_JOB_FAIR, MANAGE_JOB_FAIR, VIEW_QUEUES, MANAGE_QUEUES

// Branding and speakers
VIEW_BRANDING, MANAGE_BRANDING
```

### Helper Functions

```tsx
import { hasPermission, hasAnyPermission, hasAllPermissions, getFilteredNavItems } from '@/components/RoleGuard';

// Check single permission
if (hasPermission(user.role, 'MANAGE_COMPANIES')) {
  // Show manage companies button
}

// Check any of multiple permissions
if (hasAnyPermission(user.role, ['VIEW_COMPANIES', 'MANAGE_COMPANIES'])) {
  // Show companies section
}

// Check all permissions
if (hasAllPermissions(user.role, ['VIEW_COMPANIES', 'APPROVE_COMPANIES'])) {
  // Show approval panel
}

// Filter navigation items
const filteredNav = getFilteredNavItems(user.role, allNavItems);
```

## Navigation Filtering

The dashboard layout (`src/app/(dashboard)/layout.tsx`) automatically filters navigation items based on the user's role permissions.

### Nav Item Visibility by Role:

| Nav Item | Admin | Staff | Student | Security | Company Rep |
|----------|-------|-------|---------|----------|-------------|
| System Overview | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Companies | ✅ | ✅ | ❌ | ❌ | ❌ |
| Academic Tracks | ✅ | ✅ | ❌ | ❌ | ❌ |
| Events | ✅ | ✅ | ✅ | ❌ | ✅ |
| Job Profiles | ✅ | ✅ | ❌ | ❌ | ✅ |
| Interviews | ✅ | ✅ | ✅ | ❌ | ✅ |
| Student CVs | ✅ | ❌ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ✅ | ✅ | ❌ |
| Feedback | ✅ | ✅ | ✅ | ❌ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |

## Registration Flow Enhancements

### Private Link Registration
Students can register via a private link with pre-set role:

```
/register?type=iti-student
```

- Role is automatically set to `STUDENT`
- Role selector is locked (cannot change to Company Rep)
- Shows informational banner about ITI student registration

### Previous Student Detection
When a user enters an email during registration:
- System checks if email belongs to a previous student
- Shows warning if previous student account is detected
- Helps prevent duplicate accounts and guides users to contact admin for updates

## Middleware Protection

**Location**: `src/middleware.ts`

The middleware provides basic server-side protection:
- Public routes (login, register) are always accessible
- Protected routes check for auth token in cookies or headers
- Missing tokens redirect to login with callback URL
- Full RBAC is enforced client-side (middleware provides baseline protection)

## Testing

### Role Switching Test
1. Log in as different roles
2. Verify that unauthorized navigation items are hidden
3. Try accessing restricted routes directly via URL
4. Confirm "Access Denied" messages appear correctly

### Permission Test Checklist
- ✅ Admin can access all routes and see all nav items
- ✅ Staff can access most routes but not User Management
- ✅ Students can only access Profile, Events, Interviews, CVs, Attendance, Feedback
- ✅ Security can only access Attendance
- ✅ Company Rep can access Events, Job Profiles, Interviews, Feedback

## Future Enhancements

1. **Dynamic Permissions**: Load permissions from backend API for real-time updates
2. **Resource-Level RBAC**: Control access to specific resources (e.g., only own CVs)
3. **Audit Logging**: Track permission violations and access patterns
4. **Time-Based Access**: Restrict access during certain hours
5. **IP-Based Restrictions**: Limit admin access to specific IP ranges

## Migration Notes

### Breaking Changes
- All routes now require authentication by default
- Navigation items are filtered by role - users may see fewer options than before
- `requireAdmin` prop in AuthGuard now properly enforces admin role check

### Deprecations
- None - all changes are additive

## Files Modified/Created

### New Files
- `src/components/RoleGuard.tsx` - Main RBAC component and permission system

### Modified Files
- `src/components/AuthGuard.tsx` - Added role checking support
- `src/app/(dashboard)/layout.tsx` - Added role-aware navigation filtering
- `src/app/(auth)/register/page.tsx` - Added private link and previous student detection
- `src/middleware.ts` - Added basic token checking for protected routes
