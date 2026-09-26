import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createInterest, getInterests, exportInterestsToCSV } from '@/actions/interests';
import { interestFormLimiter, generalApiLimiter } from '@/lib/rate-limit';

/** Helper: extract real IP, accounting for Vercel/proxy headers */
function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // General rate limit for authenticated admin requests
    const ip = getIp(request);
    const limit = generalApiLimiter(ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(limit.resetInMs / 1000).toString(),
            'X-RateLimit-Limit': limit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || undefined;
    const exportCsv = searchParams.get('export') === 'true';

    if (exportCsv) {
      const csv = await exportInterestsToCSV(eventId);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const interests = await getInterests(eventId);
    return NextResponse.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🛡️ Rate limit: max 3 submissions per IP per 10 minutes
    const ip = getIp(request);
    const limit = interestFormLimiter(ip);

    if (!limit.success) {
      const retryAfterSecs = Math.ceil(limit.resetInMs / 1000);
      const retryAfterMins = Math.ceil(retryAfterSecs / 60);
      return NextResponse.json(
        {
          error: `Too many applications from your device. Please try again in ${retryAfterMins} minute${retryAfterMins > 1 ? 's' : ''}.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSecs.toString(),
            'X-RateLimit-Limit': limit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const data = await request.json();
    const interest = await createInterest(data);

    return NextResponse.json(interest, {
      headers: {
        'X-RateLimit-Limit': limit.limit.toString(),
        'X-RateLimit-Remaining': limit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating interest:', error);
    return NextResponse.json({ error: 'Failed to submit interest' }, { status: 500 });
  }
}