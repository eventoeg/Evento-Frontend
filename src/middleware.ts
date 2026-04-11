import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // For now, we'll handle auth on client-side
  // Middleware can't access sessionStorage, so we'll allow all routes
  // and let the client-side AuthGuard handle redirection
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
