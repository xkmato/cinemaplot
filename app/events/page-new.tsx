import EventsPageClient from '@/components/events-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Discover Events - Find Amazing Events Near You',
    description: 'Discover and attend amazing events in your area. From tech conferences to art exhibitions, find events that match your interests and connect with like-minded people.',
    url: '/events',
    keywords: ['events', 'discover events', 'local events', 'conferences', 'meetups', 'entertainment'],
});

export default function EventsPage() {
    return <EventsPageClient />;
}
