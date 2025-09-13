'use client';

import EventCard from "@/components/event-card";
import SharedHeader from "@/components/shared-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/lib/auth-context";
import { isEventInPast, isEventUpcomingOrOngoing } from "@/lib/helpers";
import { Calendar, Film, Play, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function EventsPageClient() {
    const { events, isLoading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date-desc");
    const [filterBy, setFilterBy] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Filter and sort events
    const filteredAndSortedEvents = useMemo(() => {
        let filtered = events.filter(event => {
            // Apply search filter
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.creatorName.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Apply date filter
            const eventDate = event.date;
            if (filterBy === "upcoming") {
                return isEventUpcomingOrOngoing(event, today);
            } else if (filterBy === "past") {
                return isEventInPast(event, today);
            } else if (filterBy === "today") {
                // For multi-day events, check if today falls within the event's date range
                if (event.isMultiDay) {
                    if (event.endDate) {
                        return today >= eventDate && today <= event.endDate;
                    }
                    // Fallback calculation using numberOfDays
                    if (event.numberOfDays && event.numberOfDays > 1) {
                        const startDate = new Date(eventDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + event.numberOfDays - 1);
                        const endDateStr = endDate.toISOString().split('T')[0];
                        return today >= eventDate && today <= endDateStr;
                    }
                }
                return eventDate === today;
            } else if (filterBy === "this-week") {
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                const weekFromNowStr = weekFromNow.toISOString().split('T')[0];
                return eventDate >= today && eventDate <= weekFromNowStr;
            } else if (filterBy === "this-month") {
                const currentMonth = today.substring(0, 7); // YYYY-MM format
                return eventDate.startsWith(currentMonth);
            }

            return true;
        });

        // Apply category filter
        if (categoryFilter !== "all") {
            if (categoryFilter === "premiere") {
                filtered = filtered.filter(event => event.isMoviePremiere);
            } else if (categoryFilter === "multi-day") {
                filtered = filtered.filter(event => event.isMultiDay);
            } else if (categoryFilter === "free") {
                filtered = filtered.filter(event => !event.price || event.price.toLowerCase().includes('free'));
            } else if (categoryFilter === "paid") {
                filtered = filtered.filter(event => event.price && !event.price.toLowerCase().includes('free'));
            }
        }

        // Sort events
        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortBy === "date-desc") {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
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

        return filtered;
    }, [events, searchTerm, sortBy, filterBy, categoryFilter, today]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => isEventUpcomingOrOngoing(event, today)).length;
        const pastEvents = events.filter(event => isEventInPast(event, today)).length;
        const moviePremieres = events.filter(event => event.isMoviePremiere).length;

        return {
            totalEvents,
            upcomingEvents,
            pastEvents,
            moviePremieres
        };
    }, [events, today]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <SharedHeader currentPage="events" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Play className="w-4 h-4 text-primary-foreground animate-pulse" />
                        </div>
                        <p className="text-lg text-muted-foreground">Loading events...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SharedHeader currentPage="events" />

            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Amazing Events
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Find events that match your interests, connect with communities, and experience unforgettable moments.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
                            <div className="text-sm text-muted-foreground">Total Events</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.upcomingEvents}</div>
                            <div className="text-sm text-muted-foreground">Upcoming</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.moviePremieres}</div>
                            <div className="text-sm text-muted-foreground">Movie Premieres</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.pastEvents}</div>
                            <div className="text-sm text-muted-foreground">Past Events</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Select value={filterBy} onValueChange={setFilterBy}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this-week">This Week</SelectItem>
                                <SelectItem value="this-month">This Month</SelectItem>
                                <SelectItem value="past">Past Events</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="premiere">Movie Premieres</SelectItem>
                                <SelectItem value="multi-day">Multi-Day Events</SelectItem>
                                <SelectItem value="free">Free Events</SelectItem>
                                <SelectItem value="paid">Paid Events</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date (Soonest)</SelectItem>
                                <SelectItem value="date-desc">Date (Latest)</SelectItem>
                                <SelectItem value="title">Title A-Z</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                                <SelectItem value="created">Recently Added</SelectItem>
                                <SelectItem value="followers">Most Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results */}
                <div>
                    {filteredAndSortedEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || filterBy !== "all" || categoryFilter !== "all"
                                    ? "Try adjusting your search or filters."
                                    : "Be the first to create an event!"}
                            </p>
                            <Button asChild>
                                <Link href="/create">Create First Event</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold">
                                    {filteredAndSortedEvents.length === 1 ? '1 Event' : `${filteredAndSortedEvents.length} Events`}
                                    {searchTerm && ` for "${searchTerm}"`}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {filterBy !== "all" && (
                                        <Badge variant="secondary" className="capitalize">
                                            {filterBy.replace('-', ' ')}
                                        </Badge>
                                    )}
                                    {categoryFilter !== "all" && (
                                        <Badge variant="outline" className="capitalize">
                                            {categoryFilter === "premiere" ? "Movie Premieres" : categoryFilter.replace('-', ' ')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16 py-12 border-t">
                    <h3 className="text-2xl font-bold mb-4">Don&apos;t see what you&apos;re looking for?</h3>
                    <p className="text-muted-foreground mb-6">
                        Create your own event and start building a community around your passion.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/create">
                            <Film className="w-4 h-4 mr-2" />
                            Create Your Event
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
