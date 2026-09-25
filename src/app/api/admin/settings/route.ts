import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateAdminPassword } from '@/actions/admin';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    await updateAdminPassword({ currentPassword, newPassword });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: error.message || 'Failed to update password' }, { status: 500 });
  }
}