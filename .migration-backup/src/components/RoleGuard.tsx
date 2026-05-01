import { ReactNode } from 'react';
import { UserRole } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

/**
 * Granular permissions map defining which roles can access which features.
 * Each permission key corresponds to a feature or route category.
 */
export const PERMISSIONS = {
  // Core navigation and dashboard access
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_PROFILE: 'VIEW_PROFILE',
  
  // Company management
  VIEW_COMPANIES: 'VIEW_COMPANIES',
  MANAGE_COMPANIES: 'MANAGE_COMPANIES',
  APPROVE_COMPANIES: 'APPROVE_COMPANIES',
  
  // Track management
  VIEW_TRACKS: 'VIEW_TRACKS',
  MANAGE_TRACKS: 'MANAGE_TRACKS',
  
  // Event management
  VIEW_EVENTS: 'VIEW_EVENTS',
  MANAGE_EVENTS: 'MANAGE_EVENTS',
  PUBLISH_EVENTS: 'PUBLISH_EVENTS',
  
  // Job profiles
  VIEW_JOB_PROFILES: 'VIEW_JOB_PROFILES',
  MANAGE_JOB_PROFILES: 'MANAGE_JOB_PROFILES',
  APPROVE_JOB_PROFILES: 'APPROVE_JOB_PROFILES',
  
  // Interviews and queues
  VIEW_INTERVIEWS: 'VIEW_INTERVIEWS',
  MANAGE_INTERVIEWS: 'MANAGE_INTERVIEWS',
  CONDUCT_INTERVIEWS: 'CONDUCT_INTERVIEWS',
  
  // Student CVs
  VIEW_STUDENT_CVS: 'VIEW_STUDENT_CVS',
  MANAGE_STUDENT_CVS: 'MANAGE_STUDENT_CVS',
  
  // Attendance
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  MANAGE_ATTENDANCE: 'MANAGE_ATTENDANCE',
  
  // Feedback
  VIEW_FEEDBACK: 'VIEW_FEEDBACK',
  MANAGE_FEEDBACK: 'MANAGE_FEEDBACK',
  
  // User management
  VIEW_USERS: 'VIEW_USERS',
  MANAGE_USERS: 'MANAGE_USERS',
  
  // Job Fair specific
  VIEW_JOB_FAIR: 'VIEW_JOB_FAIR',
  MANAGE_JOB_FAIR: 'MANAGE_JOB_FAIR',
  VIEW_QUEUES: 'VIEW_QUEUES',
  MANAGE_QUEUES: 'MANAGE_QUEUES',
  
  // Branding and speakers
  VIEW_BRANDING: 'VIEW_BRANDING',
  MANAGE_BRANDING: 'MANAGE_BRANDING',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Role-to-permissions mapping.
 * Each role gets a set of permissions.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Set<PermissionKey>> = {
  [UserRole.ADMIN]: new Set([
    // Admin has ALL permissions
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_COMPANIES,
    PERMISSIONS.MANAGE_COMPANIES,
    PERMISSIONS.APPROVE_COMPANIES,
    PERMISSIONS.VIEW_TRACKS,
    PERMISSIONS.MANAGE_TRACKS,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.PUBLISH_EVENTS,
    PERMISSIONS.VIEW_JOB_PROFILES,
    PERMISSIONS.MANAGE_JOB_PROFILES,
    PERMISSIONS.APPROVE_JOB_PROFILES,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.MANAGE_INTERVIEWS,
    PERMISSIONS.CONDUCT_INTERVIEWS,
    PERMISSIONS.VIEW_STUDENT_CVS,
    PERMISSIONS.MANAGE_STUDENT_CVS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.MANAGE_FEEDBACK,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_JOB_FAIR,
    PERMISSIONS.MANAGE_JOB_FAIR,
    PERMISSIONS.VIEW_QUEUES,
    PERMISSIONS.MANAGE_QUEUES,
    PERMISSIONS.VIEW_BRANDING,
    PERMISSIONS.MANAGE_BRANDING,
  ]),

  [UserRole.STAFF]: new Set([
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_COMPANIES,
    PERMISSIONS.MANAGE_COMPANIES,
    PERMISSIONS.VIEW_TRACKS,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_JOB_PROFILES,
    PERMISSIONS.MANAGE_JOB_PROFILES,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.MANAGE_INTERVIEWS,
    PERMISSIONS.CONDUCT_INTERVIEWS,
    PERMISSIONS.VIEW_STUDENT_CVS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.MANAGE_FEEDBACK,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_JOB_FAIR,
    PERMISSIONS.MANAGE_JOB_FAIR,
    PERMISSIONS.VIEW_QUEUES,
    PERMISSIONS.MANAGE_QUEUES,
    PERMISSIONS.VIEW_BRANDING,
    PERMISSIONS.MANAGE_BRANDING,
  ]),

  [UserRole.STUDENT]: new Set([
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.CONDUCT_INTERVIEWS,
    PERMISSIONS.VIEW_STUDENT_CVS,
    PERMISSIONS.MANAGE_STUDENT_CVS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.MANAGE_FEEDBACK,
    PERMISSIONS.VIEW_JOB_FAIR,
    PERMISSIONS.VIEW_QUEUES,
  ]),

  [UserRole.SECURITY]: new Set([
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MANAGE_ATTENDANCE,
  ]),

  [UserRole.COMPANY_REP]: new Set([
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_JOB_PROFILES,
    PERMISSIONS.MANAGE_JOB_PROFILES,
    PERMISSIONS.VIEW_INTERVIEWS,
    PERMISSIONS.CONDUCT_INTERVIEWS,
    PERMISSIONS.VIEW_QUEUES,
    PERMISSIONS.MANAGE_QUEUES,
    PERMISSIONS.VIEW_BRANDING,
    PERMISSIONS.MANAGE_BRANDING,
    PERMISSIONS.VIEW_FEEDBACK,
    PERMISSIONS.MANAGE_FEEDBACK,
  ]),
};

/**
 * Route-to-permission mapping for protecting specific paths.
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionKey[]> = {
  '/': [PERMISSIONS.VIEW_DASHBOARD],
  '/profile': [PERMISSIONS.VIEW_PROFILE],
  '/companies': [PERMISSIONS.VIEW_COMPANIES],
  '/tracks': [PERMISSIONS.VIEW_TRACKS],
  '/events': [PERMISSIONS.VIEW_EVENTS],
  '/job-profiles': [PERMISSIONS.VIEW_JOB_PROFILES],
  '/interviews': [PERMISSIONS.VIEW_INTERVIEWS],
  '/student-cvs': [PERMISSIONS.VIEW_STUDENT_CVS],
  '/attendance': [PERMISSIONS.VIEW_ATTENDANCE],
  '/feedback': [PERMISSIONS.VIEW_FEEDBACK],
  '/users': [PERMISSIONS.VIEW_USERS],
};

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(userRole: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[userRole]?.has(permission) ?? false;
}

/**
 * Check if a user has ANY of the required permissions.
 */
export function hasAnyPermission(userRole: UserRole, permissions: PermissionKey[]): boolean {
  const userPerms = ROLE_PERMISSIONS[userRole];
  if (!userPerms) return false;
  return permissions.some((perm) => userPerms.has(perm));
}

/**
 * Check if a user has ALL of the required permissions.
 */
export function hasAllPermissions(userRole: UserRole, permissions: PermissionKey[]): boolean {
  const userPerms = ROLE_PERMISSIONS[userRole];
  if (!userPerms) return false;
  return permissions.every((perm) => userPerms.has(perm));
}

/**
 * Get navigation items filtered by user's permissions.
 */
export function getFilteredNavItems(
  userRole: UserRole,
  allNavItems: Array<{ label: string; href: string; icon: string }>
): Array<{ label: string; href: string; icon: string }> {
  return allNavItems.filter((item) => {
    const requiredPerms = ROUTE_PERMISSIONS[item.href];
    if (!requiredPerms || requiredPerms.length === 0) return true;
    return hasAnyPermission(userRole, requiredPerms);
  });
}

/**
 * RoleGuard component - protects routes and UI elements based on user role.
 * 
 * Usage:
 * - <RoleGuard requiredRole="admin">...</RoleGuard>
 * - <RoleGuard requiredPermission="MANAGE_COMPANIES">...</RoleGuard>
 * - <RoleGuard requiredPermissions={["VIEW_COMPANIES", "MANAGE_COMPANIES"]}>...</RoleGuard>
 * - <RoleGuard fallback={<div>Access Denied</div>} requiredRole="admin">...</RoleGuard>
 */
interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: PermissionKey;
  requiredPermissions?: PermissionKey[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,
}: RoleGuardProps) {
  const { user, isInitialized } = useAuthStore();

  // Show nothing if not initialized yet
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  // No user means no access
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(user.role, requiredPermissions)
      : hasAnyPermission(user.role, requiredPermissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // All checks passed
  return <>{children}</>;
}
