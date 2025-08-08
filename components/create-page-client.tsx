'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, FileText, Film, Play, Star, Users } from "lucide-react";
import Link from "next/link";

export default function CreatePageClient() {
    const { user, needsNameToProceed, handleNameSubmit } = useAppContext();

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
                            <Link href="/movies" className="text-sm font-medium hover:text-primary">
                                Movies
                            </Link>
                            <Link href="/screenplays" className="text-sm font-medium hover:text-primary">
                                Preproduction
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            What Would You Like to Create?
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Share your events, movies, and screenplays with the world. Build a community around your content and connect with your audience.
                        </p>
                    </div>

                    {/* Create Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Create Event */}
                        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                            <Link href="/events/create">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Create Event</CardTitle>
                                            <CardDescription>Host an amazing event</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">
                                        Create and promote your events. From intimate workshops to large conferences, bring people together around shared interests.
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>Build your audience</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Star className="w-4 h-4 text-muted-foreground" />
                                            <span>Get followers and engagement</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>Flexible event management</span>
                                        </div>
                                    </div>

                                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Create Event
                                    </Button>
                                </CardContent>
                            </Link>
                        </Card>

                        {/* Share Movie */}
                        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                            <Link href="/movies/create">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Film className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Share Movie</CardTitle>
                                            <CardDescription>Showcase your filmmaking</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">
                                        Share your films with a passionate audience. From short films to documentaries, get your work discovered by film enthusiasts.
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Play className="w-4 h-4 text-muted-foreground" />
                                            <span>Showcase your creativity</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Star className="w-4 h-4 text-muted-foreground" />
                                            <span>Get reviews and ratings</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>Connect with film lovers</span>
                                        </div>
                                    </div>

                                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                        <Film className="w-4 h-4 mr-2" />
                                        Share Movie
                                    </Button>
                                </CardContent>
                            </Link>
                        </Card>

                        {/* Upload Screenplay */}
                        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                            <Link href="/screenplays/create">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Start Preproduction Project</CardTitle>
                                            <CardDescription>Upload script & manage project</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-6">
                                        Start your preproduction project by uploading your screenplay. Organize your project, collaborate with your team, and manage everything from script to screen.
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span>Script-to-screen project management</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Star className="w-4 h-4 text-muted-foreground" />
                                            <span>Get feedback from collaborators</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>Build your production team</span>
                                        </div>
                                    </div>

                                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Start Project
                                    </Button>
                                </CardContent>
                            </Link>
                        </Card>
                    </div>

                    {/* Benefits Section */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Why Create on CinemaPlot?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Build Community</h3>
                                <p className="text-sm text-muted-foreground">
                                    Connect with like-minded people who share your passions and interests.
                                </p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Star className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Get Discovered</h3>
                                <p className="text-sm text-muted-foreground">
                                    Reach new audiences and grow your following through our discovery features.
                                </p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Play className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Easy Sharing</h3>
                                <p className="text-sm text-muted-foreground">
                                    Simple tools to create, manage, and promote your content effectively.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
