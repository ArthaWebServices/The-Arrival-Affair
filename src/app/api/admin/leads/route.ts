import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInterests, exportInterestsToCSV } from '@/actions/interests';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId') || undefined;
  const exportCsv = searchParams.get('export') === 'true';

  try {
    if (exportCsv) {
      const csv = await exportInterestsToCSV(eventId);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`,
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