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

export async function createInterest(data: InterestInput) {
  const validated = interestSchema.parse(data);

  const interest = await prisma.interest.create({
    data: validated,
  });

  // Check if slots are filled
  const event = await prisma.event.findUnique({
    where: { id: validated.eventId },
    include: { _count: { select: { interests: true } } },
  });

  if (event && event._count.interests >= event.slotsNeeded) {
    await prisma.event.update({
      where: { id: validated.eventId },
      data: { status: 'FILLED' },
    });
  }

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
  const interest = await prisma.interest.update({
    where: { id },
    data: { status: status as any },
  });

  revalidatePath('/admin/leads');
  return interest;
}

export async function deleteInterest(id: string) {
  await prisma.interest.delete({
    where: { id },
  });

  revalidatePath('/admin/leads');
}

export async function getInterests(eventId?: string) {
  const where = eventId ? { eventId } : {};

  const interests = await prisma.interest.findMany({
    where,
    include: {
      event: {
        select: { title: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  return interests;
}

export async function exportInterestsToCSV(eventId?: string) {
  const interests = await getInterests(eventId);

  const headers = ['Name', 'Phone', 'Event', 'Status', 'Submitted At'];
  const rows = interests.map((i) => [
    i.name,
    i.phone,
    i.event.title,
    i.status,
    i.submittedAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}