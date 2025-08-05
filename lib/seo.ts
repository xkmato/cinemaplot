import type { Metadata } from 'next';
import { Event, Movie, Screenplay } from './types';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cinemaplot.com';

export function generateSEOMetadata({
  title,
  description,
  image = '/social-preview.png',
  url,
  type = 'website',
  keywords = [],
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: [
      'events',
      'movies',
      'films',
      'screenplays',
      'scripts',
      'community',
      'filmmakers',
      'cinema',
      'cinemaplot',
      ...keywords,
    ].join(', '),
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      siteName: 'CinemaPlot',
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@cinemaplot',
      site: '@cinemaplot',
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateEventMetadata(event: Event): Metadata {
  const keywords = [
    'event',
    'entertainment',
    event.location,
    ...(event.tags || []),
  ].filter(Boolean);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const description = event.description 
    ? `${event.description.slice(0, 155)}... Join this amazing event in ${event.location}. Created by ${event.creatorName}.`
    : `Join this amazing event in ${event.location}. Created by ${event.creatorName}.`;

  return generateSEOMetadata({
    title: `${event.title} - ${formattedDate}`,
    description,
    image: event.imageUrl || '/social-preview.png',
    url: `/events/${event.id}`,
    type: 'article',
    keywords,
  });
}

export function generateMovieMetadata(movie: Movie): Metadata {
  const keywords = [
    'movie',
    'film',
    'cinema',
    ...(movie.category ? [movie.category] : []),
    ...(movie.tags || []),
  ].filter(Boolean);

  const description = movie.logLine 
    ? `${movie.logLine} ${movie.synopsis?.slice(0, 100)}...`
    : `${movie.synopsis?.slice(0, 155)}...`;

  return generateSEOMetadata({
    title: `${movie.title} - ${movie.creatorName}`,
    description: `${description} Watch this amazing film by ${movie.creatorName} on CinemaPlot.`,
    image: movie.imageUrl || '/social-preview.png',
    url: `/movies/${movie.id}`,
    type: 'article',
    keywords,
  });
}

export function generateScreenplayMetadata(screenplay: Screenplay): Metadata {
  const keywords = [
    'screenplay',
    'script',
    'short film',
    ...(screenplay.genre ? [screenplay.genre] : []),
    ...(screenplay.tags || []),
  ].filter(Boolean);

  const description = screenplay.logLine 
    ? `${screenplay.logLine} ${screenplay.synopsis?.slice(0, 100)}...`
    : `${screenplay.synopsis?.slice(0, 155)}...`;

  return generateSEOMetadata({
    title: `${screenplay.title} - Screenplay by ${screenplay.creatorName}`,
    description: `${description} Read this original ${screenplay.genre || 'short film'} screenplay by ${screenplay.creatorName} on CinemaPlot.`,
    url: `/screenplays/${screenplay.id}`,
    type: 'article',
    keywords,
  });
}

export function generateEventStructuredData(event: Event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || event.title,
    startDate: event.date,
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    organizer: {
      '@type': 'Person',
      name: event.creatorName,
    },
    image: event.imageUrl || `${baseUrl}/social-preview.png`,
    url: `${baseUrl}/events/${event.id}`,
    offers: event.price && event.price !== 'Free' ? {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: event.eventLink || `${baseUrl}/events/${event.id}`,
    } : undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };
}

export function generateMovieStructuredData(movie: Movie) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.synopsis,
    director: {
      '@type': 'Person',
      name: movie.creatorName,
    },
    image: movie.imageUrl || `${baseUrl}/social-preview.png`,
    url: `${baseUrl}/movies/${movie.id}`,
    contentUrl: movie.videoUrl,
    ...(movie.duration && { duration: movie.duration }),
    ...(movie.releaseYear && { datePublished: `${movie.releaseYear}-01-01` }),
    ...(movie.averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: movie.averageRating,
        ratingCount: movie.totalRatings || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    genre: movie.category || 'Film',
    ...(movie.awards && movie.awards.length > 0 && {
      award: movie.awards,
    }),
  };
}

export function generateScreenplayStructuredData(screenplay: Screenplay) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@subType': 'Screenplay',
    name: screenplay.title,
    description: screenplay.synopsis,
    author: {
      '@type': 'Person',
      name: screenplay.creatorName,
    },
    url: `${baseUrl}/screenplays/${screenplay.id}`,
    contentUrl: screenplay.fileUrl,
    genre: screenplay.genre || 'Short Film',
    ...(screenplay.pageCount && { numberOfPages: screenplay.pageCount }),
    ...(screenplay.averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: screenplay.averageRating,
        ratingCount: screenplay.ratingCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(screenplay.tags && screenplay.tags.length > 0 && {
      keywords: screenplay.tags.join(', '),
    }),
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: screenplay.totalComments || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: screenplay.viewCount || 0,
      },
    ],
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
