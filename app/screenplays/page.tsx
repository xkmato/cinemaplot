import PreprodProjectsPageClient from '@/components/screenplays-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Discover Preproduction Projects - Explore Film Projects in Development',
    description: 'Explore film projects in preproduction, read scripts, connect with filmmakers, and join collaborative filmmaking efforts.',
    url: '/screenplays',
    keywords: ['preproduction', 'film projects', 'scripts', 'screenplays', 'filmmakers', 'collaboration', 'film development'],
});

export default function PreprodProjectsPage() {
    return <PreprodProjectsPageClient />;
}
