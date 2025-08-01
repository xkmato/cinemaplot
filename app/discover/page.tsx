'use client';

import EventCard from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/lib/auth-context";
import { Play, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function DiscoverPage() {
  const { events, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [events, searchTerm, sortBy]);

  const trendingTags = [
    "Technology",
    "Independent",
    "Drama",
    "Comedy",
    "Documentary",
    "Conference",
    "Workshop",
    "Festival",
    "Networking",
    "AI",
  ];

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
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Events</h1>
          <p className="text-lg text-muted-foreground">
            Find and join events that match your interests
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
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
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trending Tags */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

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
              {searchTerm ? "No events found matching your search." : "No events available yet."}
            </p>
            {!searchTerm && (
              <p className="mt-2">
                Be the first to create an event!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
