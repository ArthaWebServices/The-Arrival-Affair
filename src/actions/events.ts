'use server';

import { prisma } from '@/lib/prisma';
import { eventSchema, EventInput } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { withRetry } from '@/lib/retry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type { EventInput };

export async function createEvent(data: EventInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const validated = eventSchema.parse(data);

  const event = await withRetry(() =>
    prisma.event.create({
      data: {
        ...validated,
        dateStart: new Date(validated.dateStart),
        dateEnd: validated.dateEnd ? new Date(validated.dateEnd) : null,
      },
    })
  );

  revalidatePath('/admin/events');
  revalidatePath('/');
  return event;
}

export async function updateEvent(id: string, data: Partial<EventInput>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const validated = eventSchema.partial().parse(data);

  const event = await withRetry(() =>
    prisma.event.update({
      where: { id },
      data: {
        ...validated,
        dateStart: validated.dateStart ? new Date(validated.dateStart) : undefined,
        dateEnd: validated.dateEnd ? new Date(validated.dateEnd) : undefined,
      },
    })
  );

  revalidatePath('/admin/events');
  revalidatePath('/');
  revalidatePath(`/events/${id}`);
  return event;
}

export async function deleteEvent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await withRetry(() =>
    prisma.event.delete({
      where: { id },
    })
  );

  revalidatePath('/admin/events');
  revalidatePath('/');
}

export async function duplicateEvent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const event = await withRetry(() =>
    prisma.event.findUnique({
      where: { id },
    })
  );

  if (!event) throw new Error('Event not found');

  const newEvent = await withRetry(() =>
    prisma.event.create({
      data: {
        title: `${event.title} (Copy)`,
        description: event.description,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        reportingTime: event.reportingTime,
        eventHours: event.eventHours,
        location: event.location,
        mapLink: event.mapLink,
        role: event.role,
        payment: event.payment,
        perks: event.perks,
        genderReq: event.genderReq,
        slotsNeeded: event.slotsNeeded,
        contact: event.contact,
        status: 'DRAFT',
      },
    })
  );

  revalidatePath('/admin/events');
  return newEvent;
}

export async function getEvents(filters?: {
  city?: string;
  role?: string;
  genderReq?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  } else {
    where.status = { in: ['ACTIVE', 'FILLED'] };
  }

  if (filters?.city) {
    where.location = { contains: filters.city, mode: 'insensitive' };
  }

  if (filters?.role) {
    where.role = { contains: filters.role, mode: 'insensitive' };
  }

  if (filters?.genderReq) {
    where.genderReq = { contains: filters.genderReq, mode: 'insensitive' };
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.dateStart = {};
    if (filters.dateFrom) where.dateStart.gte = filters.dateFrom;
    if (filters.dateTo) where.dateStart.lte = filters.dateTo;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const events = await withRetry(() =>
    prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { interests: true },
        },
      },
      orderBy: { dateStart: 'asc' },
    })
  );

  return events;
}

export async function getEventById(id: string) {
  const event = await withRetry(() =>
    prisma.event.findUnique({
      where: { id },
      include: {
        interests: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    })
  );
  return event;
}

export async function getAdminEvents() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const events = await withRetry(() =>
    prisma.event.findMany({
      include: {
        _count: {
          select: { interests: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  );
  return events;
}