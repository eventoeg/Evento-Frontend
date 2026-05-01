import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Routes that require specific roles (pattern: route -> required role)
// Map routes to required permission keys
const protectedRoutes: Record<string, string[]> = {
  '/users': ['VIEW_USERS'],
  '/companies': ['VIEW_COMPANIES'],
  '/tracks': ['VIEW_TRACKS'],
  '/attendance': ['VIEW_ATTENDANCE'],
  '/feedback': ['VIEW_FEEDBACK'],
  '/job-profiles': ['VIEW_JOB_PROFILES'],
  '/interviews': ['VIEW_INTERVIEWS'],
  '/student-cvs': ['VIEW_STUDENT_CVS'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // For public routes, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for auth token
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // If no token found for protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  // Check if the current route has role restrictions
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to dashboard if unauthorized
        return NextResponse.redirect(new URL('/', request.url));
      }
      break;
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
