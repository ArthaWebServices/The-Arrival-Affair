import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createInterest, getInterests, exportInterestsToCSV } from '@/actions/interests';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const data = await request.json();
    const interest = await createInterest(data);
    return NextResponse.json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    return NextResponse.json({ error: 'Failed to submit interest' }, { status: 500 });
  }
}