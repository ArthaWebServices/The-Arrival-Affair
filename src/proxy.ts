import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { loginLimiter, generalApiLimiter } from '@/lib/rate-limit';

/** Extract real client IP from Vercel/proxy headers */
function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const ip = getIp(req);

    // ─── 🛡️ Brute-force protection on admin login ─────────────────────────────
    if (path === '/admin/login' && req.method === 'POST') {
      const limit = loginLimiter(ip);
      if (!limit.success) {
        const retryMins = Math.ceil(limit.resetInMs / 60000);
        return new NextResponse(
          JSON.stringify({
            error: `Too many login attempts. Try again in ${retryMins} minute${retryMins > 1 ? 's' : ''}.`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(limit.resetInMs / 1000).toString(),
            },
          }
        );
      }
    }

    // ─── 🛡️ General rate limit on public API routes ───────────────────────────
    if (path.startsWith('/api/') && !path.startsWith('/api/admin')) {
      const limit = generalApiLimiter(ip);
      if (!limit.success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please slow down.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(limit.resetInMs / 1000).toString(),
            },
          }
        );
      }
    }

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

        // Allow public routes and API routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/interests/:path*',
    '/api/events/:path*',
    '/api/push/:path*',
  ],
};