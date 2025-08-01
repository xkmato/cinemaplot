'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, Clock, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import 'react-clock/dist/Clock.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

interface CreateEventModalProps {
    onClose: () => void;
}

export default function CreateEventModal({ onClose }: CreateEventModalProps) {
    const { createEvent } = useAppContext();
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

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
            await createEvent({
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
            }, imageFile);

            onClose();
        } catch (err) {
            console.error("Error creating event:", err);
            setError("Failed to create event. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-gradient-to-b from-card to-card/95 animate-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="pb-6 border-b border-border/50">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Create a New Film Event
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Share your cinematic experience with the community
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-10 w-10 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {error && (
                        <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 animate-in slide-in-from-top-2 duration-200">
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
                            <div className="bg-gradient-to-br from-accent/30 to-accent/10 p-4 rounded-xl border border-accent/20">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="moviePremiere"
                                        checked={isMoviePremiere}
                                        onChange={(e) => setIsMoviePremiere(e.target.checked)}
                                        className="w-5 h-5 rounded-md border-2 border-primary/30 text-primary focus:ring-primary/30"
                                    />
                                    <Label htmlFor="moviePremiere" className="text-base font-medium cursor-pointer">
                                        🎬 Movie Premiere
                                    </Label>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 rounded-xl border border-secondary/20">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="multiDay"
                                        checked={isMultiDay}
                                        onChange={(e) => setIsMultiDay(e.target.checked)}
                                        className="w-5 h-5 rounded-md border-2 border-primary/30 text-primary focus:ring-primary/30"
                                    />
                                    <Label htmlFor="multiDay" className="text-base font-medium cursor-pointer">
                                        📅 Multi-day Event
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* YouTube trailer URL - only show if movie premiere is checked */}
                        {isMoviePremiere && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="trailerUrl" className="text-base font-semibold text-foreground">
                                    🎥 YouTube Trailer URL
                                </Label>
                                <Input
                                    id="trailerUrl"
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={trailerUrl}
                                    onChange={(e) => setTrailerUrl(e.target.value)}
                                    className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                />
                                <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    💡 Add a YouTube link to showcase the movie trailer
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Enhanced Date Picker */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-foreground flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Start Date</span>
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={setSelectedDate}
                                        dateFormat="MMMM d, yyyy"
                                        minDate={new Date()}
                                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                                        showPopperArrow={false}
                                        className="w-full h-12 px-3 text-base border-2 border-border rounded-md focus:border-primary/50 transition-all duration-200 bg-background/50 focus:outline-none"
                                        calendarClassName="shadow-2xl border-0 rounded-xl"
                                        dayClassName={(date) =>
                                            date < new Date() ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-primary/10'
                                        }
                                        weekDayClassName={() => 'text-muted-foreground font-medium'}
                                        monthClassName={() => 'hover:bg-primary/10'}
                                        placeholderText="Select a date..."
                                    />
                                </div>
                            </div>

                            {/* Enhanced Time Picker with Round Clock */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-foreground flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Start Time</span>
                                </Label>
                                <div className="relative">
                                    <TimePicker
                                        onChange={(value) => setSelectedTime(value || "12:00")}
                                        value={selectedTime}
                                        disableClock={false}
                                        className="w-full h-12 text-base border-2 border-border rounded-md focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        clearIcon={null}
                                        format="h:mm a"
                                    />
                                </div>
                                {selectedTime && (
                                    <div className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg border border-accent/20 flex items-center space-x-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Selected time: <strong>{selectedTime}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Number of days input - only show if multi-day is checked */}
                        {isMultiDay && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="numberOfDays" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                    <span>📊 Number of Days</span>
                                    <span className="text-destructive">*</span>
                                </Label>
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
                                    <div className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg border border-accent/20">
                                        🗓️ Event will run from <strong>{selectedDate.toLocaleDateString()}</strong> to{" "}
                                        <strong>
                                            {new Date(
                                                selectedDate.getTime() +
                                                (numberOfDays - 1) * 24 * 60 * 60 * 1000
                                            ).toLocaleDateString()}
                                        </strong>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label htmlFor="location" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                <span>📍 Location</span>
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
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span>Event will be saved in your timezone: <strong>{userTimezone}</strong></span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="image" className="text-base font-semibold text-foreground">
                                🖼️ Event Image (Optional)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="h-12 text-base border-2 border-dashed border-primary/30 focus:border-primary/50 transition-all duration-200 bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                            </div>
                            {imagePreview && (
                                <div className="mt-4 animate-in fade-in-0 duration-300">
                                    <div className="relative inline-block">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            width={300}
                                            height={180}
                                            className="rounded-xl object-cover border-2 border-primary/20 shadow-lg"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="eventLink" className="text-base font-semibold text-foreground">
                                    🔗 Event Link
                                </Label>
                                <Input
                                    id="eventLink"
                                    type="url"
                                    placeholder="Zoom, Google Meet, etc..."
                                    value={eventLink}
                                    onChange={(e) => setEventLink(e.target.value)}
                                    className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="price" className="text-base font-semibold text-foreground">
                                    💰 Price
                                </Label>
                                <Input
                                    id="price"
                                    type="text"
                                    placeholder="Leave blank for Free"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-12 px-8 text-base font-medium border-2 hover:bg-secondary/50 transition-all duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-12 px-8 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>✨ Create Event</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
