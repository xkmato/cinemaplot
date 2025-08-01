'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { shouldUseUnoptimized } from "@/lib/utils";
import { Film, Play, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MoviesPageClient() {
    const { user, needsNameToProceed, handleNameSubmit, movies } = useAppContext();

    if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
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
                            <Link href="/events" className="text-sm font-medium hover:text-primary">
                                Events
                            </Link>
                            <Link href="/movies" className="text-sm font-medium text-primary">
                                Movies
                            </Link>
                        </nav>
                        <div className="flex items-center space-x-2">
                            <Button size="sm" asChild>
                                <Link href="/movies/create">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Movie
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Amazing Films
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Watch, rate, and discover independent films from creators around the world.
                    </p>
                </div>

                {movies.length === 0 ? (
                    <div className="text-center py-16">
                        <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Movies Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Be the first to share a movie and start building your audience!
                        </p>
                        <Button asChild>
                            <Link href="/movies/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Share Your First Movie
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {movies.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative aspect-video">
                                    {movie.imageUrl ? (
                                        <Image
                                            src={movie.imageUrl}
                                            alt={movie.title}
                                            width={300}
                                            height={200}
                                            className="w-full h-full object-cover"
                                            unoptimized={shouldUseUnoptimized(movie.imageUrl)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <Film className="w-16 h-16 text-primary/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <Button className="rounded-full w-12 h-12" asChild>
                                            <Link href={`/movies/${movie.id}`}>
                                                <Play className="w-6 h-6 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {movie.logLine || movie.synopsis}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{movie.creatorName}</span>
                                        <span>{movie.category || 'Film'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
