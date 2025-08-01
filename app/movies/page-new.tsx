import MoviesPageClient from '@/components/movies-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Discover Movies - Watch Independent Films',
    description: 'Watch, rate, and discover independent films from creators around the world. Find your next favorite movie and support independent filmmakers.',
    url: '/movies',
    keywords: ['movies', 'films', 'independent films', 'cinema', 'filmmakers', 'watch movies'],
});

export default function MoviesPage() {
    return <MoviesPageClient />;
}
