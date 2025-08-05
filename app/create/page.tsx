import CreatePageClient from '@/components/create-page-client';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Create Events, Share Movies & Upload Screenplays - Start Building Your Community',
  description: 'Create amazing events, share your films, or upload screenplays to passionate audiences. Build a community around your content and connect with like-minded people.',
  url: '/create',
  keywords: ['create event', 'share movie', 'upload screenplay', 'film sharing', 'event creation', 'screenplay feedback', 'community building'],
});

export default function CreatePage() {
  return <CreatePageClient />;
}
