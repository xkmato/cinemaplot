'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { Event } from "@/lib/types";
import { Calendar, MapPin, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
    const { user, needsNameToProceed, handleNameSubmit, events, updateEvent } = useAppContext();
    const router = useRouter();
    const [eventId, setEventId] = useState<string>("");

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("12:00");
    const [location, setLocation] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [eventLink, setEventLink] = useState("");
    const [price, setPrice] = useState("");
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [numberOfDays, setNumberOfDays] = useState(1);
    const [isMoviePremiere, setIsMoviePremiere] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [tags, setTags] = useState("");
    const [event, setEvent] = useState<Event | null>(null);

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get event ID from params
    useEffect(() => {
        params.then(({ id }) => {
            setEventId(id);
        });
    }, [params]);

    // Load event data
    useEffect(() => {
        if (!eventId) return;
        
        const foundEvent = events.find(e => e.id === eventId);
        if (foundEvent) {
            if (foundEvent.creatorId !== user?.uid) {
                router.push(`/events/${eventId}`);
                return;
            }
            
            setEvent(foundEvent);
            setTitle(foundEvent.title || "");
            setDescription(foundEvent.description || "");
            setSelectedDate(foundEvent.date ? new Date(foundEvent.date) : new Date());
            setSelectedTime(foundEvent.time || "12:00");
            setLocation(foundEvent.location || "");
            setEventLink(foundEvent.eventLink || "");
            setPrice(foundEvent.price || "");
            setIsMultiDay(foundEvent.isMultiDay || false);
            setNumberOfDays(foundEvent.numberOfDays || 1);
            setIsMoviePremiere(foundEvent.isMoviePremiere || false);
            setTrailerUrl(foundEvent.trailerUrl || "");
            setTags(foundEvent.tags?.join(", ") || "");
            setImagePreview(foundEvent.imageUrl || null);
        }
    }, [eventId, events, user, router]);

    if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading event...</p>
                </div>
            </div>
        );
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : "";

        if (!title || !formattedDate || !location) {
            setError(
                "Please fill in all required fields: Title, Date, and Location."
            );
            return;
        }

        if (isMultiDay && numberOfDays < 1) {
            setError("Number of days must be at least 1.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const eventData = {
                title,
                description,
                date: formattedDate,
                time: selectedTime,
                location,
                eventLink,
                price,
                isMultiDay: isMultiDay && numberOfDays > 1,
                numberOfDays: isMultiDay ? numberOfDays : 1,
                isMoviePremiere,
                trailerUrl: isMoviePremiere ? trailerUrl : undefined,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

            await updateEvent(eventId, eventData, imageFile);

            // Success - redirect to event detail page
            router.push(`/events/${eventId}`);
        } catch (err) {
            console.error("Error updating event:", err);
            setError(err instanceof Error ? err.message : "Failed to update event. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold">CinemaPlot</span>
                        </Link>
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
                            <Link href="/screenplays" className="text-sm font-medium hover:text-primary">
                                Screenplays
                            </Link>
                            <Link href="/create" className="text-sm font-medium hover:text-primary">
                                Create
                            </Link>
                        </nav>
                        <Button variant="ghost" size="sm">
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 bg-gradient-to-b from-card to-card/95">
                        <CardHeader className="pb-6 border-b border-border/50">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center space-x-3">
                                        <Calendar className="w-8 h-8 text-primary" />
                                        <span>Edit Event</span>
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm">
                                        Update your event details and settings
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.back()}
                                    className="h-10 w-10 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {error && (
                                <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Event Title</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter your event title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                </div>

                                {/* Description Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-semibold text-foreground">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell us about your event..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50 resize-none"
                                    />
                                </div>

                                {/* Special Event Types */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isMultiDay}
                                                onChange={(e) => setIsMultiDay(e.target.checked)}
                                                className="w-4 h-4 text-primary border-2 border-primary/30 rounded focus:ring-primary"
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">Multi-Day Event</div>
                                                <div className="text-sm text-muted-foreground">Festival, workshop series, etc.</div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isMoviePremiere}
                                                onChange={(e) => setIsMoviePremiere(e.target.checked)}
                                                className="w-4 h-4 text-primary border-2 border-primary/30 rounded focus:ring-primary"
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">Movie Premiere</div>
                                                <div className="text-sm text-muted-foreground">Include trailer support</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* YouTube trailer URL - only show if movie premiere is checked */}
                                {isMoviePremiere && (
                                    <div className="space-y-3">
                                        <Label htmlFor="trailerUrl" className="text-base font-semibold text-foreground">
                                            Trailer URL (YouTube)
                                        </Label>
                                        <Input
                                            id="trailerUrl"
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={trailerUrl}
                                            onChange={(e) => setTrailerUrl(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div className="space-y-3">
                                        <Label htmlFor="date" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                            <span>Event Date</span>
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                            required
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div className="space-y-3">
                                        <Label htmlFor="time" className="text-base font-semibold text-foreground">Time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>
                                </div>

                                {/* Number of days input - only show if multi-day is checked */}
                                {isMultiDay && (
                                    <div className="space-y-3">
                                        <Label htmlFor="numberOfDays" className="text-base font-semibold text-foreground">Number of Days</Label>
                                        <Input
                                            id="numberOfDays"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={numberOfDays}
                                            onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                                            required
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                        {numberOfDays > 1 && selectedDate && (
                                            <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                                📅 Event runs from {selectedDate.toLocaleDateString()} to{' '}
                                                {new Date(selectedDate.getTime() + (numberOfDays - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label htmlFor="location" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>Location</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Where will this event take place..."
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                </div>

                                {/* Show timezone info to user */}
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <div className="text-sm">
                                        <strong>Timezone:</strong> {userTimezone}
                                        <p className="text-muted-foreground mt-1">
                                            Your event will be displayed in each user&apos;s local timezone.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="eventLink" className="text-base font-semibold text-foreground">Event Link (Optional)</Label>
                                    <Input
                                        id="eventLink"
                                        type="url"
                                        placeholder="https://your-event-website.com or meeting link..."
                                        value={eventLink}
                                        onChange={(e) => setEventLink(e.target.value)}
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="price" className="text-base font-semibold text-foreground">Price</Label>
                                        <Input
                                            id="price"
                                            type="text"
                                            placeholder="Free, $10, UGX 20,000, etc."
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="tags" className="text-base font-semibold text-foreground">Tags</Label>
                                        <Input
                                            id="tags"
                                            type="text"
                                            placeholder="Workshop, Networking, Premiere, Festival (comma-separated)"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <Label htmlFor="image" className="text-base font-semibold text-foreground">Event Image (Optional)</Label>
                                    <div className="space-y-4">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="h-12 text-base border-2 border-dashed border-primary/30 focus:border-primary/50 transition-all duration-200 bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        {imagePreview && (
                                            <div className="relative w-64 h-36 rounded-lg overflow-hidden border-2 border-border/50">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Event image preview"
                                                    width={256}
                                                    height={144}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Leave empty to keep your current event image. Upload a new image only if you want to replace it.
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border/50">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="sm:w-auto"
                                    >
                                        {isLoading ? "Updating..." : "Update Event"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
