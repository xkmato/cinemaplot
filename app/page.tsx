'use client';

import AuthScreen from "@/components/auth-screen";
import CreateEventModal from "@/components/create-event-modal";
import EventCard from "@/components/event-card";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { user, events, isLoading, needsNameToProceed, handleNameSubmit, handleLogout } = useAppContext();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Show authentication screen as modal if user tries to create event
  const handleCreateEvent = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateEventModal(true);
    }
  };

  // Get recent events for homepage
  const recentEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const featuredMovies = [
    {
      id: 1,
      title: "The Last Journey",
      description: "A heartwarming story about finding purpose",
      category: "Short Film",
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Digital Dreams",
      description: "Exploring the intersection of technology and humanity",
      category: "Web Episode",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

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
                  <Button size="sm" onClick={handleCreateEvent}>Get Started</Button>
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
            <Button size="lg" className="text-lg px-8" onClick={handleCreateEvent}>
              Create Your First Event
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/discover">Explore Content</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{events.length}+</div>
              <div className="text-muted-foreground">Events Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5K+</div>
              <div className="text-muted-foreground">Films Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
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
              <Button onClick={handleCreateEvent}>Create First Event</Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popular Movies</h2>
            <Button variant="outline" asChild>
              <Link href="/movies">View All Movies</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2">{movie.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{movie.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {movie.rating}
                    </div>
                    <div>{movie.reviews} reviews</div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/movies/${movie.id}`}>Watch Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
          <Button size="lg" className="text-lg px-8" onClick={handleCreateEvent}>
            Start Creating Today
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
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-foreground">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms
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
      {showCreateEventModal && (
        <CreateEventModal onClose={() => setShowCreateEventModal(false)} />
      )}

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
