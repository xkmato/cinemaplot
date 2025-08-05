import ScreenplaysPageClient from '@/components/screenplays-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Discover Screenplays - Read Original Short Film Scripts',
    description: 'Read, comment on, and discuss original short film screenplays from emerging filmmakers. Join the community conversation around creative storytelling.',
    url: '/screenplays',
    keywords: ['screenplays', 'scripts', 'short films', 'filmmakers', 'creative writing', 'storytelling'],
});

export default function ScreenplaysPage() {
    return <ScreenplaysPageClient />;
}
