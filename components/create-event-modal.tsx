'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CreateEventModalProps {
    onClose: () => void;
}

export default function CreateEventModal({ onClose }: CreateEventModalProps) {
    const { createEvent } = useAppContext();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [eventLink, setEventLink] = useState("");
    const [price, setPrice] = useState("");
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [numberOfDays, setNumberOfDays] = useState(1);

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
        if (!title || !date || !location) {
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
                date,
                time,
                location,
                eventLink,
                price,
                isMultiDay: isMultiDay && numberOfDays > 1,
                numberOfDays: isMultiDay ? numberOfDays : 1,
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Create a New Film Event</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-600 dark:text-red-200">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title *</Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Event Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Event description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Multi-day event checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="multiDay"
                                checked={isMultiDay}
                                onChange={(e) => setIsMultiDay(e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="multiDay">Multi-day event</Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Start Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Start Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Number of days input - only show if multi-day is checked */}
                        {isMultiDay && (
                            <div className="space-y-2">
                                <Label htmlFor="numberOfDays">Number of Days *</Label>
                                <Input
                                    id="numberOfDays"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={numberOfDays}
                                    onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                                    required
                                />
                                {numberOfDays > 1 && date && (
                                    <div className="text-sm text-muted-foreground">
                                        Event will run from {date} to{" "}
                                        {new Date(
                                            new Date(date).getTime() +
                                            (numberOfDays - 1) * 24 * 60 * 60 * 1000
                                        )
                                            .toISOString()
                                            .slice(0, 10)}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                type="text"
                                placeholder="Event location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>

                        {/* Show timezone info to user */}
                        <div className="text-sm text-muted-foreground">
                            Event will be saved in your timezone: {userTimezone}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Event Image (Optional)</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        width={200}
                                        height={120}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventLink">Event Link</Label>
                            <Input
                                id="eventLink"
                                type="url"
                                placeholder="Zoom, Google Meet, etc."
                                value={eventLink}
                                onChange={(e) => setEventLink(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="text"
                                placeholder="Leave blank for Free"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Event"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
