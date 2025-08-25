// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;
  
  // Check if user is authenticated
  const isAuthenticated = token && verifyJwt(token);
  console.log({isAuthenticated, token})
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // If user is not authenticated and accessing root, redirect to login
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // If user is authenticated and accessing root, redirect to dashboard
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // For protected routes, add user info to headers
  if (isAuthenticated && isProtectedRoute) {
    const decodedToken = verifyJwt(token);
    const response = NextResponse.next();
    
    if (decodedToken) {
      response.headers.set('x-user-id', decodedToken.userId);
      response.headers.set('x-user-email', decodedToken.email);
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
    runtime: "nodejs",
}