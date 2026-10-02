import { notFound } from 'next/navigation';
import { getEventById } from '@/actions/events';
import EventDetailClient from './EventDetailClient';

// Cache each event page for 60 seconds on the edge.
// At 10k users, only 1 DB query fires per minute instead of 10,000.
export const revalidate = 60;


interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event || (event.status !== 'ACTIVE' && event.status !== 'FILLED')) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}