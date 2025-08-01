import DiscoverPageClient from '@/components/discover-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Discover - Find Events & Movies Near You',
    description: 'Discover amazing events and independent films in your area. Find what inspires you, connect with communities, and experience unforgettable moments.',
    url: '/discover',
    keywords: ['discover', 'events near me', 'movies', 'entertainment', 'local events', 'community'],
});

export default function DiscoverPage() {
    return <DiscoverPageClient />;
}
