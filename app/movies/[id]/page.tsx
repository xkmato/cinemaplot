import MovieDetailClient from '@/components/movie-detail-client';
import { appId, db } from '@/lib/firebase';
import { generateBreadcrumbStructuredData, generateMovieMetadata } from '@/lib/seo';
import { Movie } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

async function getMovie(id: string): Promise<Movie | null> {
  try {
    const movieDocRef = doc(db, `artifacts/${appId}/public/data/movies`, id);
    const movieDoc = await getDoc(movieDocRef);

    if (movieDoc.exists()) {
      const movieData = { id: movieDoc.id, ...movieDoc.data() } as Movie;

      // Filter out deleted or paused movies for public access
      if (movieData.deleted || movieData.paused) {
        return null;
      }

      return movieData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return {
      title: 'Movie Not Found | CinemaPlot',
      description: 'The movie you are looking for could not be found.',
    };
  }

  return generateMovieMetadata(movie);
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    notFound();
  }

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Movies', url: '/movies' },
    { name: movie.title, url: `/movies/${movie.id}` },
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

      <MovieDetailClient movieId={id} />
    </>
  );
}
