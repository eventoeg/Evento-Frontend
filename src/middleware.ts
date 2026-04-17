import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Routes that require specific roles (pattern: route -> required role)
// Note: This is a basic enforcement. Full RBAC is handled client-side.
const protectedRoutes: Record<string, string[]> = {
  '/users': ['admin'],
  '/companies': ['admin', 'staff'],
  '/tracks': ['admin', 'staff'],
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
  // Note: We can't access sessionStorage in middleware, so we check for cookie
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If no token found for protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  // Full role-based checks are handled client-side via AuthGuard and RoleGuard
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
