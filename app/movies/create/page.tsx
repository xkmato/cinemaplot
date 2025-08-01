'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { Film, Play, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateMoviePage() {
    const { user, needsNameToProceed, handleNameSubmit, createMovie } = useAppContext();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [logLine, setLogLine] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [category, setCategory] = useState("");
    const [duration, setDuration] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [tags, setTags] = useState("");
    const [awards, setAwards] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

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

    const validateVideoUrl = (url: string) => {
        const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+(&[\w=]*)?$/;
        const vimeoPattern = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)[\d]+$/;
        return youtubePattern.test(url) || vimeoPattern.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !logLine || !synopsis || !videoUrl) {
            setError("Please fill in all required fields: Title, Log Line, Synopsis, and Video URL.");
            return;
        }

        if (!validateVideoUrl(videoUrl)) {
            setError("Please enter a valid YouTube or Vimeo URL.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Create movie data object
            const movieData = {
                title,
                logLine,
                synopsis,
                videoUrl,
                category,
                duration,
                releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                awards: awards.trim() ? awards.split('\n').map(award => award.trim()).filter(award => award) : undefined,
            };

            console.log("Movie data:", movieData);
            // Create movie with image upload
            await createMovie(movieData, imageFile);

            // Success - redirect to movies page
            router.push('/movies');
        } catch (err) {
            console.error("Error creating movie:", err);
            setError("Failed to create movie. Please try again.");
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
                                <Play className="w-4 h-4 text-primary-foreground" />
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
                                        <Film className="w-8 h-8 text-primary" />
                                        <span>Share Your Film</span>
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm">
                                        Share your creative work with the CinemaPlot community
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
                                <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-4 py-3 rounded-lg animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Movie Title</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter your movie title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                </div>

                                {/* Log Line */}
                                <div className="space-y-3">
                                    <Label htmlFor="logLine" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Log Line</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="logLine"
                                        type="text"
                                        placeholder="A one-sentence description of your movie..."
                                        value={logLine}
                                        onChange={(e) => setLogLine(e.target.value)}
                                        required
                                        maxLength={150}
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        {logLine.length}/150 characters - Keep it short and compelling!
                                    </div>
                                </div>

                                {/* Synopsis */}
                                <div className="space-y-3">
                                    <Label htmlFor="synopsis" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Synopsis</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="synopsis"
                                        placeholder="Provide a detailed description of your movie, including plot, themes, and what makes it special..."
                                        value={synopsis}
                                        onChange={(e) => setSynopsis(e.target.value)}
                                        required
                                        rows={5}
                                        className="text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50 resize-none"
                                    />
                                </div>

                                {/* Video URL */}
                                <div className="space-y-3">
                                    <Label htmlFor="videoUrl" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Video URL</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="videoUrl"
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        required
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                        💡 Supported platforms: YouTube and Vimeo. Make sure your video is public or unlisted.
                                    </div>
                                </div>

                                {/* Category and Duration */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="category" className="text-base font-semibold text-foreground">
                                            Category
                                        </Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50">
                                                <SelectValue placeholder="Select category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="short-film">Short Film</SelectItem>
                                                <SelectItem value="web-episode">Web Episode</SelectItem>
                                                <SelectItem value="documentary">Documentary</SelectItem>
                                                <SelectItem value="music-video">Music Video</SelectItem>
                                                <SelectItem value="experimental">Experimental</SelectItem>
                                                <SelectItem value="animation">Animation</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="duration" className="text-base font-semibold text-foreground">
                                            Duration
                                        </Label>
                                        <Input
                                            id="duration"
                                            type="text"
                                            placeholder="e.g., 15 minutes"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>
                                </div>

                                {/* Release Year and Tags */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="releaseYear" className="text-base font-semibold text-foreground">
                                            Release Year
                                        </Label>
                                        <Input
                                            id="releaseYear"
                                            type="number"
                                            placeholder="2024"
                                            value={releaseYear}
                                            onChange={(e) => setReleaseYear(e.target.value)}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="tags" className="text-base font-semibold text-foreground">
                                            Tags
                                        </Label>
                                        <Input
                                            id="tags"
                                            type="text"
                                            placeholder="Drama, Comedy, Thriller (comma-separated)"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                        />
                                        <div className="text-sm text-muted-foreground">
                                            Separate tags with commas to help people discover your film
                                        </div>
                                    </div>
                                </div>

                                {/* Awards and Recognition */}
                                <div className="space-y-3">
                                    <Label htmlFor="awards" className="text-base font-semibold text-foreground">
                                        Awards and Recognition
                                    </Label>
                                    <Textarea
                                        id="awards"
                                        placeholder="List any awards, nominations, or recognition your film has received (one per line)..."
                                        value={awards}
                                        onChange={(e) => setAwards(e.target.value)}
                                        rows={3}
                                        className="text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50 resize-none"
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        Include film festival selections, awards, or any notable recognition. Put each award on a new line.
                                    </div>
                                </div>

                                {/* Poster Image */}
                                <div className="space-y-3">
                                    <Label htmlFor="image" className="text-base font-semibold text-foreground">
                                        🖼️ Movie Poster/Thumbnail (Optional)
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
                                                    alt="Poster preview"
                                                    width={300}
                                                    height={400}
                                                    className="rounded-xl object-cover border-2 border-primary/20 shadow-lg"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tips Section */}
                                <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-xl border border-accent/20">
                                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                                        <Upload className="w-5 h-5" />
                                        <span>Tips for Success</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div>
                                            <strong>Log Line:</strong> Think of it as your movie&apos;s elevator pitch - one compelling sentence.
                                        </div>
                                        <div>
                                            <strong>Synopsis:</strong> Provide enough detail to intrigue viewers without spoiling the story.
                                        </div>
                                        <div>
                                            <strong>Video Quality:</strong> Ensure your video has good audio and visual quality.
                                        </div>
                                        <div>
                                            <strong>Poster:</strong> A striking poster can significantly increase views and engagement.
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border/50">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
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
                                                <span>Publishing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Film className="w-4 h-4" />
                                                <span>Publish Movie</span>
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
