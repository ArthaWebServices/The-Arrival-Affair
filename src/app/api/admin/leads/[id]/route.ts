import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateInterestStatus, deleteInterest } from '@/actions/interests';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const interest = await updateInterestStatus(id, status);
    return NextResponse.json(interest);
  } catch (error) {
    console.error('Error updating interest:', error);
    return NextResponse.json({ error: 'Failed to update interest' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteInterest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting interest:', error);
    return NextResponse.json({ error: 'Failed to delete interest' }, { status: 500 });
  }
}