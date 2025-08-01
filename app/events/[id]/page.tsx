import EventDetailClient from '@/components/event-detail-client';
import { appId, db } from '@/lib/firebase';
import { generateBreadcrumbStructuredData, generateEventMetadata } from '@/lib/seo';
import { Event } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const eventDocRef = doc(db, `artifacts/${appId}/public/data/events`, id);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;

      // Filter out deleted or paused events for public access
      if (eventData.deleted || eventData.paused) {
        return null;
      }

      return eventData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found | CinemaPlot',
      description: 'The event you are looking for could not be found.',
    };
  }

  return generateEventMetadata(event);
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Events', url: '/events' },
    { name: event.title, url: `/events/${event.id}` },
  ]);

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      <EventDetailClient eventId={id} />
    </>
  );
}
