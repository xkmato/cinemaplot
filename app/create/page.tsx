import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import CreatePageClient from '@/components/create-page-client';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Create Events & Share Movies - Start Building Your Community',
  description: 'Create amazing events or share your films with passionate audiences. Build a community around your content and connect with like-minded people.',
  url: '/create',
  keywords: ['create event', 'share movie', 'film sharing', 'event creation', 'community building'],
});

export default function CreatePage() {
  return <CreatePageClient />;
}
