'use server';

import { prisma } from '@/lib/prisma';
import { interestSchema, InterestInput } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

import { withRetry } from '@/lib/retry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function createInterest(data: InterestInput) {
  const validated = interestSchema.parse(data);

  const { interest, event } = await withRetry(async () => {
    // We use a transaction to ensure both operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      const newInterest = await tx.interest.create({
        data: validated,
      });

      const event = await tx.event.findUnique({
        where: { id: validated.eventId },
        include: { _count: { select: { interests: true } } },
      });

      if (event && event._count.interests >= event.slotsNeeded) {
        await tx.event.update({
          where: { id: validated.eventId },
          data: { status: 'FILLED' },
        });
      }

      return { interest: newInterest, event };
    });
  });

  revalidatePath(`/events/${validated.eventId}`);
  revalidatePath('/admin/leads');

  // Send Push Notifications to Admins
  try {
    const subscriptions = await prisma.pushSubscription.findMany();
    const notificationPayload = JSON.stringify({
      title: 'New Lead Alert! 🚀',
      body: `${validated.name} just applied for ${event?.title || 'an event'}. Check the Leads dashboard.`,
    });

    const pushPromises = subscriptions.map((sub: any) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        notificationPayload
      ).catch((err) => {
        // If subscription is gone, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Push notification failed:', err);
      })
    );
    await Promise.all(pushPromises);
  } catch (err) {
    console.error('Error sending push notifications:', err);
  }

  return interest;
}

export async function updateInterestStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const interest = await withRetry(() => 
    prisma.interest.update({
      where: { id },
      data: { status: status as any },
    })
  );

  revalidatePath('/admin/leads');
  return interest;
}

export async function deleteInterest(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await withRetry(() =>
    prisma.interest.delete({
      where: { id },
    })
  );

  revalidatePath('/admin/leads');
}

export async function getInterests(eventId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const where = eventId ? { eventId } : {};

  const interests = await withRetry(() =>
    prisma.interest.findMany({
      where,
      include: {
        event: {
          select: { title: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })
  );

  return interests;
}

export async function exportInterestsToCSV(eventId?: string) {
  const interests = await getInterests(eventId);

  const headers = ['Name', 'Phone', 'Email', 'Gender', 'Food Preference', 'Event', 'Transaction ID', 'Status', 'Submitted At'];
  const rows = interests.map((i: any) => [
    i.name,
    i.phone,
    i.email || '',
    i.gender || '',
    i.foodPreference || '',
    i.event.title,
    i.transactionId || '',
    i.status,
    i.submittedAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell: any) => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}