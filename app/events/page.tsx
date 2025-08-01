'use client';

import EventCard from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/lib/auth-context";
import { isEventInPast, isEventUpcomingOrOngoing } from "@/lib/helpers";
import { Calendar, Film, Play, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function EventsPage() {
    const { events, isLoading, user } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
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

                // For multi-day events, check if any part of the event falls within this week
                if (event.isMultiDay) {
                    const eventEndDate = event.endDate || (() => {
                        if (event.numberOfDays && event.numberOfDays > 1) {
                            const startDate = new Date(eventDate);
                            const endDate = new Date(startDate);
                            endDate.setDate(startDate.getDate() + event.numberOfDays - 1);
                            return endDate.toISOString().split('T')[0];
                        }
                        return eventDate;
                    })();

                    // Event overlaps with this week if:
                    // - Event starts before or during this week AND
                    // - Event ends during or after today
                    return eventDate <= weekFromNowStr && eventEndDate >= today;
                }

                return eventDate >= today && eventDate <= weekFromNowStr;
            }

            return true; // "all" filter
        });

        // Apply category filter
        if (categoryFilter !== "all") {
            if (categoryFilter === "movie-premieres") {
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
            switch (sortBy) {
                case "date":
                    if (filterBy === "past") {
                        // For past events, show most recent first
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    } else {
                        // For upcoming events, show soonest first
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                    }
                case "title":
                    return a.title.localeCompare(b.title);
                case "location":
                    return a.location.localeCompare(b.location);
                case "creator":
                    return a.creatorName.localeCompare(b.creatorName);
                case "followers":
                    return (b.followers?.length || 0) - (a.followers?.length || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [events, searchTerm, sortBy, filterBy, categoryFilter, today]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => isEventUpcomingOrOngoing(event, today)).length;
        const pastEvents = events.filter(event => isEventInPast(event, today)).length;

        // For "today" events, check if multi-day events are active today
        const todayEvents = events.filter(event => {
            if (event.isMultiDay) {
                if (event.endDate) {
                    return today >= event.date && today <= event.endDate;
                }
                if (event.numberOfDays && event.numberOfDays > 1) {
                    const startDate = new Date(event.date);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + event.numberOfDays - 1);
                    const endDateStr = endDate.toISOString().split('T')[0];
                    return today >= event.date && today <= endDateStr;
                }
            }
            return event.date === today;
        }).length;

        const moviePremieres = events.filter(event => event.isMoviePremiere).length;
        const multiDayEvents = events.filter(event => event.isMultiDay).length;

        return {
            total: totalEvents,
            upcoming: upcomingEvents,
            past: pastEvents,
            today: todayEvents,
            moviePremieres,
            multiDay: multiDayEvents,
        };
    }, [events, today]);

    // Get categories for filter
    const categories = [
        { value: "all", label: "All Events", count: stats.total },
        { value: "movie-premieres", label: "Movie Premieres", count: stats.moviePremieres },
        { value: "multi-day", label: "Multi-day Events", count: stats.multiDay },
        { value: "free", label: "Free Events", count: events.filter(e => !e.price || e.price.toLowerCase().includes('free')).length },
        { value: "paid", label: "Paid Events", count: events.filter(e => e.price && !e.price.toLowerCase().includes('free')).length },
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
                                <Link href="/discover" className="text-sm font-medium hover:text-primary">
                                    Discover
                                </Link>
                                <Link href="/events" className="text-sm font-medium text-primary">
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
                                <Link href="/create">Create Event</Link>
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
                            <Link href="/discover" className="text-sm font-medium hover:text-primary">
                                Discover
                            </Link>
                            <Link href="/events" className="text-sm font-medium text-primary">
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
                            {user && (
                                <span className="text-sm text-muted-foreground hidden sm:block">
                                    Welcome, {user.displayName || 'User'}
                                </span>
                            )}
                            <Button asChild>
                                <Link href="/create">Create Event</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">All Events</h1>
                    <p className="text-lg text-muted-foreground">
                        Discover amazing events from the CinemaPlot community
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.upcoming}</div>
                        <div className="text-sm text-muted-foreground">Upcoming</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{stats.today}</div>
                        <div className="text-sm text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{stats.past}</div>
                        <div className="text-sm text-muted-foreground">Past</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 mb-1">{stats.moviePremieres}</div>
                        <div className="text-sm text-muted-foreground">Movie Premieres</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{stats.multiDay}</div>
                        <div className="text-sm text-muted-foreground">Multi-day</div>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col gap-4 mb-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events by title, description, location, or creator..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={filterBy} onValueChange={setFilterBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this-week">This Week</SelectItem>
                                <SelectItem value="past">Past Events</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label} ({category.count})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                                <SelectItem value="creator">Creator</SelectItem>
                                <SelectItem value="followers">Popularity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {searchTerm && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Search: &quot;{searchTerm}&quot;
                            <button
                                onClick={() => setSearchTerm("")}
                                className="ml-1 text-xs hover:text-destructive"
                            >
                                ✕
                            </button>
                        </Badge>
                    )}
                    {filterBy !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {filterBy === "upcoming" && "Upcoming Events"}
                            {filterBy === "past" && "Past Events"}
                            {filterBy === "today" && "Today's Events"}
                            {filterBy === "this-week" && "This Week"}
                            <button
                                onClick={() => setFilterBy("all")}
                                className="ml-1 text-xs hover:text-destructive"
                            >
                                ✕
                            </button>
                        </Badge>
                    )}
                    {categoryFilter !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            {categoryFilter === "movie-premieres" && <Film className="w-3 h-3" />}
                            {categoryFilter === "multi-day" && <Calendar className="w-3 h-3" />}
                            {categoryFilter === "free" && <span className="text-xs">FREE</span>}
                            {categoryFilter === "paid" && <span className="text-xs">$</span>}
                            {categories.find(c => c.value === categoryFilter)?.label}
                            <button
                                onClick={() => setCategoryFilter("all")}
                                className="ml-1 text-xs hover:text-destructive"
                            >
                                ✕
                            </button>
                        </Badge>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredAndSortedEvents.length} of {events.length} events
                    </p>
                </div>

                {/* Events Grid */}
                {filteredAndSortedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        {searchTerm || filterBy !== "all" || categoryFilter !== "all" ? (
                            <>
                                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your search or filters to find what you&apos;re looking for.
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilterBy("all");
                                            setCategoryFilter("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                    <Button asChild>
                                        <Link href="/create">Create Event</Link>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Be the first to create an event and start building your community!
                                </p>
                                <Button asChild>
                                    <Link href="/create">Create First Event</Link>
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* Load More Button (for future pagination) */}
                {filteredAndSortedEvents.length > 0 && filteredAndSortedEvents.length >= 12 && (
                    <div className="text-center mt-8">
                        <Button variant="outline" disabled>
                            Load More Events (Coming Soon)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
