'use server';

import { prisma } from '@/lib/prisma';
import { adminSchema, loginSchema, settingsSchema, AdminInput, LoginInput, SettingsInput } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withRetry } from '@/lib/retry';

export async function createAdmin(data: AdminInput) {
  const validated = adminSchema.parse(data);

  const existing = await withRetry(() =>
    prisma.admin.findUnique({
      where: { email: validated.email },
    })
  );

  if (existing) throw new Error('Admin with this email already exists');

  const passwordHash = await bcrypt.hash(validated.password, 12);

  const admin = await withRetry(() =>
    prisma.admin.create({
      data: {
        email: validated.email,
        passwordHash,
      },
    })
  );

  revalidatePath('/admin/settings');
  return { id: admin.id, email: admin.email };
}

export async function loginAdmin(data: LoginInput) {
  const validated = loginSchema.parse(data);

  const admin = await withRetry(() =>
    prisma.admin.findUnique({
      where: { email: validated.email },
    })
  );

  if (!admin) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(validated.password, admin.passwordHash);

  if (!isValid) throw new Error('Invalid credentials');

  return { id: admin.id, email: admin.email };
}

export async function updateAdminPassword(data: SettingsInput) {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error('Unauthorized');

  const validated = settingsSchema.parse(data);

  if (!validated.currentPassword || !validated.newPassword) {
    throw new Error('Current and new password required');
  }

  const admin = await withRetry(() =>
    prisma.admin.findUnique({
      where: { id: userId },
    })
  );

  if (!admin) throw new Error('Admin not found');

  const isValid = await bcrypt.compare(validated.currentPassword, admin.passwordHash);

  if (!isValid) throw new Error('Current password is incorrect');

  const passwordHash = await bcrypt.hash(validated.newPassword, 12);

  await withRetry(() =>
    prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    })
  );

  return { success: true };
}

export async function getAdmins() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error('Unauthorized');

  const admins = await withRetry(() =>
    prisma.admin.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  );

  return admins;
}

export async function deleteAdmin(id: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) throw new Error('Unauthorized');
  if (userId === id) throw new Error('Cannot delete yourself');

  await withRetry(() =>
    prisma.admin.delete({
      where: { id },
    })
  );

  revalidatePath('/admin/settings');
}