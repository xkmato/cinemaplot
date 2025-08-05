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
import { FileText, Play, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateScreenplayPage() {
    const { user, needsNameToProceed, handleNameSubmit, createScreenplay } = useAppContext();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [logLine, setLogLine] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [genre, setGenre] = useState("");
    const [tags, setTags] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError("Only PDF files are allowed for screenplays");
                return;
            }

            const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSizeInBytes) {
                setError("File size must be less than 10MB");
                return;
            }

            setPdfFile(file);
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !logLine || !synopsis || !genre || !pdfFile) {
            setError("Please fill in all required fields and upload a PDF file.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const screenplayData = {
                title,
                logLine,
                synopsis,
                genre,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

            await createScreenplay(screenplayData, pdfFile);
            router.push('/screenplays');
        } catch (err) {
            console.error("Error creating screenplay:", err);
            setError(err instanceof Error ? err.message : "Failed to upload screenplay. Please try again.");
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
                                        <FileText className="w-8 h-8 text-primary" />
                                        <span>Upload Screenplay</span>
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm">
                                        Share your short film screenplay with the community
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
                                        <span>Screenplay Title</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Enter your screenplay title..."
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
                                        placeholder="A one-sentence description of your screenplay..."
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
                                        placeholder="Provide a detailed description of your screenplay's story, themes, and style..."
                                        value={synopsis}
                                        onChange={(e) => setSynopsis(e.target.value)}
                                        required
                                        rows={5}
                                        className="text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50 resize-none"
                                    />
                                </div>

                                {/* Genre */}
                                <div className="space-y-3">
                                    <Label htmlFor="genre" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>Genre</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={genre} onValueChange={setGenre}>
                                        <SelectTrigger className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50">
                                            <SelectValue placeholder="Select genre..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="drama">Drama</SelectItem>
                                            <SelectItem value="comedy">Comedy</SelectItem>
                                            <SelectItem value="thriller">Thriller</SelectItem>
                                            <SelectItem value="horror">Horror</SelectItem>
                                            <SelectItem value="science-fiction">Science Fiction</SelectItem>
                                            <SelectItem value="romance">Romance</SelectItem>
                                            <SelectItem value="action">Action</SelectItem>
                                            <SelectItem value="documentary">Documentary</SelectItem>
                                            <SelectItem value="experimental">Experimental</SelectItem>
                                            <SelectItem value="animation">Animation</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags */}
                                <div className="space-y-3">
                                    <Label htmlFor="tags" className="text-base font-semibold text-foreground">
                                        Tags (Optional)
                                    </Label>
                                    <Input
                                        id="tags"
                                        type="text"
                                        placeholder="Character-driven, Dark comedy, Coming of age (comma-separated)"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="h-12 text-base border-2 focus:border-primary/50 transition-all duration-200 bg-background/50"
                                    />
                                    <div className="text-sm text-muted-foreground">
                                        Separate tags with commas to help readers discover your screenplay
                                    </div>
                                </div>

                                {/* PDF Upload */}
                                <div className="space-y-3">
                                    <Label htmlFor="pdf" className="text-base font-semibold text-foreground flex items-center space-x-1">
                                        <span>📄 Screenplay PDF</span>
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="pdf"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            required
                                            className="h-12 text-base border-2 border-dashed border-primary/30 focus:border-primary/50 transition-all duration-200 bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                        💡 Upload your screenplay as a PDF. Maximum file size: 10MB. Page count will be automatically detected during processing. For best reading experience, use proper screenplay formatting.
                                    </div>
                                    {pdfFile && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-accent/20 p-3 rounded-lg">
                                            <FileText className="w-4 h-4" />
                                            <span>{pdfFile.name}</span>
                                            <span>({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    )}
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
                                                <span>Uploading...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Upload className="w-4 h-4" />
                                                <span>Upload Screenplay</span>
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
