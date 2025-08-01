'use client';

import EventCard from "@/components/event-card";
import MovieCard from "@/components/movie-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/lib/auth-context";
import { isEventUpcomingOrOngoing } from "@/lib/helpers";
import { Play, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function DiscoverPage() {
  const { events, movies, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [activeTab, setActiveTab] = useState("events");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter and sort events (only today and future events, including ongoing multi-day events)
  const filteredAndSortedEvents = useMemo(() => {
    const upcomingEvents = events.filter(event => {
      // Show events that are upcoming or currently ongoing (for multi-day events)
      return isEventUpcomingOrOngoing(event, today);
    });

    const filtered = upcomingEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "location":
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, sortBy, today]);

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    const filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.logLine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.synopsis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.tags && movie.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
        case "title":
          return a.title.localeCompare(b.title);
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0); // Highest rating first
        default:
          return 0;
      }
    });

    return filtered;
  }, [movies, searchTerm, sortBy]);

  // Get trending tags from actual data in the database
  const trendingTags = useMemo(() => {
    const allTags = new Set<string>();

    // Collect tags from events
    events.forEach(event => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach(tag => allTags.add(tag.trim()));
      }
    });

    // Collect tags from movies
    movies.forEach(movie => {
      if (movie.tags && Array.isArray(movie.tags)) {
        movie.tags.forEach(tag => allTags.add(tag.trim()));
      }
      // Also include categories as tags
      if (movie.category) {
        allTags.add(movie.category);
      }
    });

    // Convert to array and sort by frequency/relevance
    const tagsArray = Array.from(allTags).filter(tag => tag.length > 0);

    // Sort alphabetically for now, but could be enhanced to sort by frequency
    return tagsArray.sort().slice(0, 15); // Limit to 15 tags to keep UI clean
  }, [events, movies]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">CinemaPlot</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/discover" className="text-sm font-medium text-primary">
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
              <Button asChild>
                <Link href="/create">Create</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Loading events...</p>
          </div>
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CinemaPlot</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-sm font-medium text-primary">
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
            <Button asChild>
              <Link href="/create">Create</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Events & Films</h1>
          <p className="text-lg text-muted-foreground">
            Find upcoming events and discover creative films from independent creators
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{activeTab === "events" ? "Date" : "Newest"}</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              {activeTab === "events" ? (
                <SelectItem value="location">Location</SelectItem>
              ) : (
                <SelectItem value="rating">Rating</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Trending Tags */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.length > 0 ? (
              trendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSearchTerm(tag)}
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags available yet. Create events and movies with tags to see them here!</p>
            )}
          </div>
        </div>

        {/* Tabs for Events and Films */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="films">Films</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            {/* Events Grid */}
            {filteredAndSortedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-lg">
                  {searchTerm ? "No upcoming events found matching your search." : "No upcoming events available."}
                </p>
                {!searchTerm && (
                  <p className="mt-2">
                    Be the first to create an event!
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="films" className="mt-6">
            {/* Movies Grid */}
            {filteredAndSortedMovies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-lg">
                  {searchTerm ? "No films found matching your search." : "No films available yet."}
                </p>
                {!searchTerm && (
                  <p className="mt-2">
                    Be the first to share a film!
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
