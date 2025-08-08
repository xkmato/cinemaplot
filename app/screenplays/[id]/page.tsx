import ScreenplayDetailClient from '@/components/screenplay-detail-client';
import { appId, db } from '@/lib/firebase';
import { generateBreadcrumbStructuredData, generateSEOMetadata } from '@/lib/seo';
import { Screenplay } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ScreenplayPageProps {
    params: Promise<{ id: string }>;
}

async function getScreenplay(id: string): Promise<Screenplay | null> {
    try {
        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, id);
        const screenplayDoc = await getDoc(screenplayDocRef);

        if (screenplayDoc.exists()) {
            const screenplayData = { id: screenplayDoc.id, ...screenplayDoc.data() } as Screenplay;

            // Filter out deleted or paused screenplays for public access
            if (screenplayData.deleted || screenplayData.paused) {
                return null;
            }

            return screenplayData;
        }

        return null;
    } catch (error) {
        console.error('Error fetching screenplay:', error);
        return null;
    }
}

export async function generateMetadata({ params }: ScreenplayPageProps): Promise<Metadata> {
    const { id } = await params;
    const screenplay = await getScreenplay(id);

    if (!screenplay) {
        return generateSEOMetadata({
            title: 'Project Not Found',
            description: 'The requested preproduction project could not be found.',
            url: `/screenplays/${id}`,
        });
    }

    const keywords = [
        'preproduction',
        'film project',
        'screenplay',
        'script',
        'filmmaking',
        ...(screenplay.genre ? [screenplay.genre] : []),
        ...(screenplay.tags || []),
    ].filter(Boolean);

    const description = screenplay.logLine
        ? `${screenplay.logLine} ${screenplay.synopsis?.slice(0, 100)}...`
        : `${screenplay.synopsis?.slice(0, 155)}...`;

    return generateSEOMetadata({
        title: `${screenplay.title} - Preproduction Project by ${screenplay.creatorName}`,
        description: `${description} Explore this ${screenplay.genre || 'film'} preproduction project on CinemaPlot.`,
        url: `/screenplays/${screenplay.id}`,
        type: 'article',
        keywords,
    });
}

export default async function ScreenplayDetailPage({ params }: ScreenplayPageProps) {
    const { id } = await params;
    const screenplay = await getScreenplay(id);

    if (!screenplay) {
        notFound();
    }

    const breadcrumbStructuredData = generateBreadcrumbStructuredData([
        { name: 'Home', url: '/' },
        { name: 'Preproduction', url: '/screenplays' },
        { name: screenplay.title, url: `/screenplays/${screenplay.id}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData),
                }}
            />
            <ScreenplayDetailClient screenplayId={id} />
        </>
    );
}
