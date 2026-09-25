import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/actions/events';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    city: searchParams.get('city') || undefined,
    role: searchParams.get('role') || undefined,
    genderReq: searchParams.get('genderReq') || undefined,
    status: searchParams.get('status') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    search: searchParams.get('search') || undefined,
  };

  try {
    const events = await getEvents(filters);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}