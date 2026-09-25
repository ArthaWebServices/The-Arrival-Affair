import { notFound } from 'next/navigation';
import { getEventById } from '@/actions/events';
import EventDetailClient from './EventDetailClient';

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