'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Film, Play, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function MoviesPage() {
    const { user, needsNameToProceed, handleNameSubmit, movies } = useAppContext(); if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
    } return (
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
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Movies</h1>
                        <p className="text-lg text-muted-foreground">
                            Discover amazing films from independent creators
                        </p>
                    </div>
                    <div className="flex space-x-3 mt-4 sm:mt-0">
                        <Button variant="outline" size="sm">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                        <Button asChild>
                            <Link href="/movies/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Share Film
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Movies Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                        <Card key={movie.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <Link href={`/movies/${movie.id}`}>
                                <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <Film className="w-12 h-12 text-primary/50" />
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {movie.logLine}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>{movie.category}</span>
                                        <span>{movie.duration}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        by {movie.creatorName}
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>

                {/* Empty State (when no movies) */}
                {movies.length === 0 && (
                    <div className="text-center py-12">
                        <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No movies yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Be the first to share your creative work with the community!
                        </p>
                        <Button asChild>
                            <Link href="/movies/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Share Your First Film
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
