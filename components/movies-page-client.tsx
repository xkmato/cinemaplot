'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import SharedHeader from "@/components/shared-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/auth-context";
import { shouldUseUnoptimized } from "@/lib/utils";
import { Film, Play, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function MoviesPageClient() {
    const { user, needsNameToProceed, handleNameSubmit, movies } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter movies based on search query
    const filteredMovies = useMemo(() => {
        if (!searchQuery.trim()) {
            return movies;
        }

        const query = searchQuery.toLowerCase();
        return movies.filter(movie => {
            return (
                movie.title.toLowerCase().includes(query) ||
                movie.logLine?.toLowerCase().includes(query) ||
                movie.synopsis?.toLowerCase().includes(query) ||
                movie.creatorName.toLowerCase().includes(query) ||
                movie.category?.toLowerCase().includes(query) ||
                movie.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                movie.awards?.some(award => award.toLowerCase().includes(query))
            );
        });
    }, [movies, searchQuery]);

    if (!user) {
        return <AuthScreen />;
    }

    if (needsNameToProceed) {
        return <GetUserNameModal onSubmit={handleNameSubmit} />;
    }

    return (
        <div className="min-h-screen bg-background">
            <SharedHeader currentPage="movies" />

            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Amazing Films
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Watch, rate, and discover independent films from creators around the world.
                    </p>

                    {/* Search Input */}
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search movies by title, description, creator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {filteredMovies.length === 0 ? (
                    <div className="text-center py-16">
                        {searchQuery.trim() ? (
                            <>
                                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No movies found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Try adjusting your search terms or browse all movies.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                    className="mb-4"
                                >
                                    Clear Search
                                </Button>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {searchQuery.trim() && (
                            <div className="mb-6 text-center">
                                <p className="text-muted-foreground">
                                    Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMovies.map((movie) => (
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
                    </>
                )}
            </div>
        </div>
    );
}
