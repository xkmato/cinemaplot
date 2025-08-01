'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, Clock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "react-clock/dist/Clock.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";

export default function CreateEventPage() {
    const { user, needsNameToProceed, handleNameSubmit, createEvent } = useAppContext();
    const router = useRouter();

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

    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
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
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            }, imageFile);

            // Success - redirect to events page
            router.push('/events');
        } catch (err) {
            console.error("Error creating event:", err);
            setError("Failed to create event. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">CinemaPlot</span>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/discover" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                Discover
                            </Link>
                            <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                Events
                            </Link>
                            <Link href="/movies" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                Movies
                            </Link>
                            <Link href="/create" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                Create
                            </Link>
                        </nav>
                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800">
                        <CardHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-3">
                                        <Calendar className="w-8 h-8 text-blue-600" />
                                        <span>Create a New Film Event</span>
                                    </CardTitle>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Share your cinematic experience with the community
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.back()}
                                    className="h-10 w-10 p-0 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                                        <span>Event Title</span>
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter your event title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Description Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell us about your event..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="text-base border-2 focus:border-blue-500 transition-all duration-200 resize-none"
                                    />
                                </div>

                                {/* Special Event Types */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="moviePremiere"
                                                checked={isMoviePremiere}
                                                onChange={(e) => setIsMoviePremiere(e.target.checked)}
                                                className="w-5 h-5 rounded-md border-2 border-blue-300 text-blue-600 focus:ring-blue-300"
                                            />
                                            <div>
                                                <Label htmlFor="moviePremiere" className="text-sm font-semibold cursor-pointer text-gray-900 dark:text-gray-100">
                                                    🎬 Movie Premiere
                                                </Label>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">This is a film premiere or screening</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="multiDay"
                                                checked={isMultiDay}
                                                onChange={(e) => setIsMultiDay(e.target.checked)}
                                                className="w-5 h-5 rounded-md border-2 border-green-300 text-green-600 focus:ring-green-300"
                                            />
                                            <div>
                                                <Label htmlFor="multiDay" className="text-sm font-semibold cursor-pointer text-gray-900 dark:text-gray-100">
                                                    📅 Multi-Day Event
                                                </Label>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Event spans multiple days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube trailer URL - only show if movie premiere is checked */}
                                {isMoviePremiere && (
                                    <div className="space-y-3">
                                        <Label htmlFor="trailerUrl" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            🎥 YouTube Trailer URL
                                        </Label>
                                        <Input
                                            id="trailerUrl"
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={trailerUrl}
                                            onChange={(e) => setTrailerUrl(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                        />
                                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                            💡 Add a YouTube link to showcase the movie trailer
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Enhanced Date Picker */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Date</span>
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={setSelectedDate}
                                                dateFormat="MMMM d, yyyy"
                                                minDate={new Date()}
                                                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                                                showPopperArrow={false}
                                                className="w-full h-12 px-3 text-base border-2 border-gray-300 rounded-md focus:border-blue-500 transition-all duration-200 focus:outline-none"
                                                calendarClassName="shadow-2xl border-0 rounded-xl"
                                                placeholderText="Select a date..."
                                            />
                                        </div>
                                    </div>

                                    {/* Enhanced Time Picker */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Time</span>
                                        </Label>
                                        <div className="relative">
                                            <TimePicker
                                                onChange={(value) => setSelectedTime(value || "12:00")}
                                                value={selectedTime}
                                                disableClock={false}
                                                className="w-full h-12 text-base border-2 border-gray-300 rounded-md focus:border-blue-500 transition-all duration-200"
                                                clearIcon={null}
                                                format="h:mm a"
                                            />
                                        </div>
                                        {selectedTime && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                🕒 Time will be displayed in your timezone: {userTimezone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Number of days input - only show if multi-day is checked */}
                                {isMultiDay && (
                                    <div className="space-y-3">
                                        <Label htmlFor="numberOfDays" className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                                            <span>Number of Days</span>
                                        </Label>
                                        <Input
                                            id="numberOfDays"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={numberOfDays}
                                            onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                                            required
                                            className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                        />
                                        {numberOfDays > 1 && selectedDate && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                                🗓️ Event will run from {selectedDate.toLocaleDateString()} to{" "}
                                                {new Date(selectedDate.getTime() + (numberOfDays - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label htmlFor="location" className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-1">
                                        <span>📍 Location</span>
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Where will this event take place..."
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Show timezone info to user */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Event will be saved in your timezone: {userTimezone}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="image" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        🖼️ Event Image (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="h-12 text-base border-2 border-dashed border-blue-300 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                        />
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <div className="relative inline-block">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Event preview"
                                                    width={300}
                                                    height={200}
                                                    className="rounded-xl object-cover border-2 border-blue-200 shadow-lg"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="eventLink" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            🔗 Event Link
                                        </Label>
                                        <Input
                                            id="eventLink"
                                            type="url"
                                            placeholder="Zoom, Google Meet, etc..."
                                            value={eventLink}
                                            onChange={(e) => setEventLink(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="price" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            💰 Price
                                        </Label>
                                        <Input
                                            id="price"
                                            type="text"
                                            placeholder="Leave blank for Free"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-3">
                                    <Label htmlFor="tags" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        🏷️ Tags
                                    </Label>
                                    <Input
                                        id="tags"
                                        type="text"
                                        placeholder="Workshop, Networking, Premiere, Festival (comma-separated)"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Separate tags with commas to help people discover your event
                                    </div>
                                </div>

                                {/* Tips Section */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold mb-3 flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                                        <Calendar className="w-5 h-5" />
                                        <span>Tips for Success</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            <strong>Clear Title:</strong> Use descriptive titles that explain what your event is about.
                                        </div>
                                        <div>
                                            <strong>Detailed Description:</strong> Provide enough information for attendees to know what to expect.
                                        </div>
                                        <div>
                                            <strong>Event Image:</strong> Add an attractive image to make your event stand out.
                                        </div>
                                        <div>
                                            <strong>Relevant Tags:</strong> Use specific tags to help people find your event more easily.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="h-12 px-8 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-12 px-8 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                <span>Creating Event...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Create Event</span>
                                            </div>
                                        )}
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
