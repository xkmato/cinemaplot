'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import ScreenplayCard from "@/components/screenplay-card";
import SharedHeader from "@/components/shared-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/auth-context";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function PreprodProjectsPageClient() {
    const { user, screenplays, needsNameToProceed, handleNameSubmit } = useAppContext();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter screenplays based on search query
    const filteredScreenplays = useMemo(() => {
        if (!searchQuery.trim()) {
            return screenplays;
        }

        const query = searchQuery.toLowerCase();
        return screenplays.filter(screenplay => {
            return (
                screenplay.title.toLowerCase().includes(query) ||
                screenplay.description?.toLowerCase().includes(query) ||
                screenplay.author?.toLowerCase().includes(query) ||
                screenplay.creatorName?.toLowerCase().includes(query) ||
                screenplay.logLine?.toLowerCase().includes(query) ||
                screenplay.synopsis?.toLowerCase().includes(query) ||
                screenplay.genre?.toLowerCase().includes(query) ||
                screenplay.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        });
    }, [screenplays, searchQuery]);

    // Sort projects by creation date (newest first)
    const sortedProjects = filteredScreenplays
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen bg-background">
            <SharedHeader currentPage="screenplays" />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            Discover Preproduction Projects
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Explore film projects in development, read scripts, and connect with emerging filmmakers.
                        </p>

                        {/* Search Input */}
                        <div className="max-w-md mx-auto relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search projects by title, description, author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {sortedProjects.length === 0 ? (
                        <div className="text-center py-16">
                            {searchQuery.trim() ? (
                                <>
                                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Try adjusting your search terms or browse all projects.
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
                                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Be the first to start a preproduction project and connect with collaborators!
                                    </p>
                                    <Button asChild>
                                        <Link href="/screenplays/create">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Start Your First Project
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
                                        Found {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedProjects.map((screenplay) => (
                                    <ScreenplayCard key={screenplay.id} screenplay={screenplay} />
                                ))}
                            </div>
                        </>
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
