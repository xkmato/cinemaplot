'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import ScreenplayCard from "@/components/screenplay-card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/auth-context";
import { FileText, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ScreenplaysPageClient() {
    const { user, screenplays, needsNameToProceed, handleNameSubmit } = useAppContext();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Sort screenplays by creation date (newest first)
    const sortedScreenplays = screenplays
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                            <Link href="/screenplays" className="text-sm font-medium text-primary">
                                Screenplays
                            </Link>
                            <Link href="/create" className="text-sm font-medium hover:text-primary">
                                Create
                            </Link>
                        </nav>
                        <div className="flex items-center space-x-2">
                            {user ? (
                                <Button size="sm" asChild>
                                    <Link href="/screenplays/create">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Upload Screenplay
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                                    Sign In
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            Discover Screenplays
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Read, comment, and discuss original short film screenplays from emerging filmmakers.
                        </p>
                    </div>

                    {sortedScreenplays.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Screenplays Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Be the first to share a screenplay and get feedback from the community!
                            </p>
                            <Button asChild>
                                <Link href="/screenplays/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Upload Your First Screenplay
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedScreenplays.map((screenplay) => (
                                <ScreenplayCard key={screenplay.id} screenplay={screenplay} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAuthModal && !user && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAuthModal(false)}
                            className="absolute -top-2 -right-2 h-8 w-8 p-0 bg-background rounded-full z-10"
                        >
                            ✕
                        </Button>
                        <AuthScreen />
                    </div>
                </div>
            )}

            {user && needsNameToProceed && (
                <GetUserNameModal onSubmit={handleNameSubmit} />
            )}
        </div>
    );
}
