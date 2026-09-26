import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to login page without authentication
    if (path === '/admin/login') {
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Protect all admin routes
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (path === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow login page without token
        if (path === '/admin/login') {
          return true;
        }

        // Require token for all other admin routes
        if (path.startsWith('/admin')) {
          return !!token;
        }

        // Allow public routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};