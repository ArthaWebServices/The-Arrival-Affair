'use server';

import { prisma } from '@/lib/prisma';

export async function checkApplicationStatus(phone: string) {
  try {
    const applications = await prisma.interest.findMany({
      where: { phone },
      include: {
        event: {
          select: { title: true, eventType: true, dateStart: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return { success: true, applications };
  } catch (error: any) {
    console.error('Error fetching status:', error);
    return { success: false, error: 'Failed to fetch status' };
  }
}
