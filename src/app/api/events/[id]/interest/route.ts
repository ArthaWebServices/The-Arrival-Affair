import { NextRequest, NextResponse } from 'next/server';
import { createInterest } from '@/actions/interests';
import { interestSchema } from '@/lib/validations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validated = interestSchema.parse({ ...body, eventId: id });

    const interest = await createInterest(validated);

    return NextResponse.json(interest);
  } catch (error: any) {
    console.error('Error creating interest:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to submit interest' }, { status: 500 });
  }
}