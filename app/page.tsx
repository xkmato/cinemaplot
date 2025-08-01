'use client';

import AuthScreen from "@/components/auth-screen";
import EventCard from "@/components/event-card";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { isEventUpcomingOrOngoing } from "@/lib/helpers";
import { createPlaceholderDataUrl } from "@/lib/placeholder-svg";
import { shouldUseUnoptimized } from "@/lib/utils";
import { Calendar, Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { user, events, movies, isLoading, needsNameToProceed, handleNameSubmit, handleLogout } = useAppContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get recent events for homepage
  const recentEvents = events
    .filter(event => isEventUpcomingOrOngoing(event))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  // Calculate real statistics
  const totalEvents = events.length;
  const totalMovies = movies.length;

  // Calculate unique community members (creators + followers)
  const uniqueCreatorIds = new Set([
    ...events.map(event => event.creatorId),
    ...movies.map(movie => movie.creatorId)
  ]);

  const uniqueFollowerIds = new Set(
    events.flatMap(event => event.followers || [])
  );

  // Combine creators and followers, removing duplicates
  const allUniqueMembers = new Set([...uniqueCreatorIds, ...uniqueFollowerIds]);
  const totalCommunityMembers = allUniqueMembers.size;

  // Get featured movies (recent movies with good ratings, fallback to recent movies)
  const featuredMovies = (() => {
    // First try to get movies with good ratings (4.0+)
    const highRatedMovies = movies
      .filter(movie => movie.averageRating && movie.averageRating >= 4.0)
      .sort((a, b) => {
        if (b.averageRating! !== a.averageRating!) {
          return b.averageRating! - a.averageRating!;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);

    // If we have enough high-rated movies, return them
    if (highRatedMovies.length >= 2) {
      return highRatedMovies;
    }

    // Otherwise, return the most recent movies
    return movies
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="w-4 h-4 text-primary-foreground" />
          </div>
          <p className="text-lg">Loading CinemaPlot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CinemaPlot</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-sm font-medium hover:text-primary">
                Discover
              </Link>
              <Link href="/events" className="text-sm font-medium hover:text-primary">
                Events
              </Link>
              <Link href="/movies" className="text-sm font-medium hover:text-primary">
                Movies
              </Link>
              <Link href="/create" className="text-sm font-medium hover:text-primary">
                Create
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Welcome, {user.displayName || 'User'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/create">Create</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/create">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Create, Share & Discover
            <span className="block text-primary">Amazing Events & Films</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build a community around your events and movies. Connect with audiences, get followers, and make your
            content discoverable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/create">Add Event or Film</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/discover">Explore Events and Films</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{totalEvents}</div>
              <div className="text-muted-foreground">Events Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{totalMovies}</div>
              <div className="text-muted-foreground">Films Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{totalCommunityMembers || 0}</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {recentEvents.length > 0 ? 'Upcoming Events' : 'Recent Events'}
            </h2>
            <Button variant="outline" asChild>
              <Link href="/discover">View All Events</Link>
            </Button>
          </div>
          {recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create an event and start building your community!
              </p>
              <Button asChild>
                <Link href="/create">Create First Event</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {featuredMovies.some(movie => movie.averageRating && movie.averageRating >= 4.0)
                ? 'Featured Movies'
                : 'Recent Movies'}
            </h2>
            <Button variant="outline" asChild>
              <Link href="/movies">View All Movies</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMovies.length > 0 ? (
              featuredMovies.map((movie) => (
                <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={movie.imageUrl || createPlaceholderDataUrl('movie', movie.title, 300, 200)}
                      alt={movie.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                      unoptimized={movie.imageUrl ? shouldUseUnoptimized(movie.imageUrl) : false}
                    />
                    <Badge className="absolute top-2 left-2">{movie.category || 'Film'}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{movie.logLine}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {movie.averageRating?.toFixed(1) || 'N/A'}
                      </div>
                      <div>{movie.totalRatings || 0} reviews</div>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/movies/${movie.id}`}>Watch Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Featured Movies Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share a movie and start building your audience!
                </p>
                <Button asChild>
                  <Link href="/movies/create">Share Your First Movie</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Your Community?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are using CinemaPlot to promote their events and films to engaged audiences.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/create">Start Creating Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">CinemaPlot</span>
              </div>
              <p className="text-muted-foreground">
                The platform for creators to build communities around their events and films.
              </p>
            </div>
            <div></div>
            <div></div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/discover" className="hover:text-foreground">
                    Discover
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="hover:text-foreground">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-foreground">
                    Create
                  </Link>
                </li>
              </ul>
            </div>


          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 CinemaPlot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-2 -right-2 h-8 w-8 p-0 bg-background rounded-full z-10"
            >
              ✕
            </Button>
            <AuthScreen />
          </div>
        </div>
      )}

      {user && needsNameToProceed && (
        <GetUserNameModal onSubmit={handleNameSubmit} />
      )}
    </div>
  );
}
