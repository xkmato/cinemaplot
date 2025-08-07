"use client";

import EventCard from "@/components/event-card";
import ScreenplayCard from "@/components/screenplay-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function UserProfilePage() {
    const { user, events, movies, screenplays } = useAppContext();
    // Local bio state only (not persisted)
    const [bio, setBio] = useState("");
    const [editing, setEditing] = useState(false);

    // Filter user's work
    const userEvents = events.filter(e => e.creatorId === user?.uid);
    const userMovies = movies.filter(m => m.creatorId === user?.uid);
    const userScreenplays = screenplays.filter(s => s.authorId === user?.uid);

    // Portfolio header
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">CinemaPlot Portfolio</span>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </header>
            <section className="py-12 px-4">
                <div className="container mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex flex-col items-center md:items-start md:w-1/3">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4">
                            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground bg-muted">👤</div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{user?.displayName || "User"}</h2>
                        <p className="text-muted-foreground mb-2">{user?.email}</p>
                        <div className="mb-4">
                            {editing ? (
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    rows={3}
                                />
                            ) : (
                                <p className="text-lg text-muted-foreground whitespace-pre-line">{bio || "No bio yet. Add something about yourself!"}</p>
                            )}
                            <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditing(!editing)}>
                                {editing ? "Save Bio" : "Edit Bio"}
                            </Button>
                        </div>
                    </div>
                    <div className="md:w-2/3 w-full">
                        <h3 className="text-xl font-semibold mb-4">My Work</h3>
                        <div className="mb-8">
                            <h4 className="font-semibold mb-2">Events</h4>
                            {userEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userEvents.map(event => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No events yet.</p>
                            )}
                        </div>
                        <div className="mb-8">
                            <h4 className="font-semibold mb-2">Movies</h4>
                            {userMovies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userMovies.map(movie => (
                                        <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="relative">
                                                <Image
                                                    src={movie.imageUrl || "/placeholder.svg"}
                                                    alt={movie.title}
                                                    width={300}
                                                    height={200}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <Badge className="absolute top-2 left-2">{movie.category || "Film"}</Badge>
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                                                <CardDescription className="line-clamp-2">{movie.logLine}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                                        {movie.averageRating?.toFixed(1) || "N/A"}
                                                    </div>
                                                    <div>{movie.totalRatings || 0} reviews</div>
                                                </div>
                                                <Button className="w-full" asChild>
                                                    <a href={`/movies/${movie.id}`}>Watch Now</a>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No movies yet.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Screenplays</h4>
                            {userScreenplays.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userScreenplays.map(screenplay => (
                                        <ScreenplayCard key={screenplay.id} screenplay={screenplay} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No screenplays yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <footer className="border-t py-8 mt-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; 2025 CinemaPlot. Portfolio generated for {user?.displayName || "User"}.</p>
                </div>
            </footer>
        </div>
    );
}
