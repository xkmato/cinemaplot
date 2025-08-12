'use client';

import EventCard from "@/components/event-card";
import MovieCard from "@/components/movie-card";
import SharedHeader from "@/components/shared-header";
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

export default function DiscoverPageClient() {
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

        const filtered = upcomingEvents.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        // Sort events
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            } else if (sortBy === "location") {
                return a.location.localeCompare(b.location);
            } else if (sortBy === "created") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "followers") {
                const aFollowers = a.followers?.length || 0;
                const bFollowers = b.followers?.length || 0;
                return bFollowers - aFollowers;
            }
            return 0;
        });

        return filtered.slice(0, 20); // Limit to 20 results for performance
    }, [events, searchTerm, sortBy, today]);

    // Filter and sort movies
    const filteredAndSortedMovies = useMemo(() => {
        const filtered = movies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.synopsis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.logLine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                movie.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        // Sort movies
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            } else if (sortBy === "rating") {
                const aRating = a.averageRating || 0;
                const bRating = b.averageRating || 0;
                return bRating - aRating;
            } else if (sortBy === "created") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });

        return filtered.slice(0, 20); // Limit to 20 results for performance
    }, [movies, searchTerm, sortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <SharedHeader currentPage="discover" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Play className="w-4 h-4 text-primary-foreground animate-pulse" />
                        </div>
                        <p className="text-lg text-muted-foreground">Loading content...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SharedHeader currentPage="discover" />

            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Amazing Content
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Find events and movies that match your interests. Connect with communities and experience unforgettable moments.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-md mx-auto mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search events and movies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex justify-center">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="created">Recently Added</SelectItem>
                                <SelectItem value="followers">Most Popular</SelectItem>
                                <SelectItem value="rating">Highest Rated (Movies)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="events" className="text-center">
                                Events ({filteredAndSortedEvents.length})
                            </TabsTrigger>
                            <TabsTrigger value="movies" className="text-center">
                                Movies ({filteredAndSortedMovies.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="events">
                        <div className="space-y-6">
                            {/* Results header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">
                                    {filteredAndSortedEvents.length === 1 ? '1 Event' : `${filteredAndSortedEvents.length} Events`}
                                    {searchTerm && ` for "${searchTerm}"`}
                                </h2>
                                {searchTerm && (
                                    <Badge variant="secondary">
                                        Searching
                                    </Badge>
                                )}
                            </div>

                            {/* Events grid */}
                            {filteredAndSortedEvents.length === 0 ? (
                                <div className="text-center py-12">
                                    <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm
                                            ? "Try adjusting your search terms."
                                            : "No upcoming events available at the moment."
                                        }
                                    </p>
                                    <Button asChild>
                                        <Link href="/create">Create First Event</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="movies">
                        <div className="space-y-6">
                            {/* Results header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">
                                    {filteredAndSortedMovies.length === 1 ? '1 Movie' : `${filteredAndSortedMovies.length} Movies`}
                                    {searchTerm && ` for "${searchTerm}"`}
                                </h2>
                                {searchTerm && (
                                    <Badge variant="secondary">
                                        Searching
                                    </Badge>
                                )}
                            </div>

                            {/* Movies grid */}
                            {filteredAndSortedMovies.length === 0 ? (
                                <div className="text-center py-12">
                                    <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm
                                            ? "Try adjusting your search terms."
                                            : "No movies available at the moment."
                                        }
                                    </p>
                                    <Button asChild>
                                        <Link href="/movies/create">Share First Movie</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedMovies.map((movie) => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* CTA Section */}
                <div className="text-center mt-16 py-12 border-t">
                    <h3 className="text-2xl font-bold mb-4">Ready to Share Your Content?</h3>
                    <p className="text-muted-foreground mb-6">
                        Create an event or share a movie to start building your community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/events/create">Create Event</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/movies/create">Share Movie</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
