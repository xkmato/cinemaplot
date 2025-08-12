'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/auth-context";
import { getFullName } from "@/lib/helpers";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SharedHeaderProps {
    showCreateButton?: boolean;
    className?: string;
    currentPage?: 'home' | 'discover' | 'events' | 'movies' | 'screenplays';
}

export default function SharedHeader({ showCreateButton = true, className = "", currentPage = 'home' }: SharedHeaderProps) {
    const { user, needsNameToProceed, handleNameSubmit, handleLogout } = useAppContext();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const getNavLinkClass = (page: string) => {
        return currentPage === page
            ? "text-sm font-medium text-primary"
            : "text-sm font-medium hover:text-primary";
    };

    return (
        <>
            <header className={`border-b ${className}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Play className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <Link href="/">
                                <span className="text-xl font-bold hover:text-primary">CinemaPlot</span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/discover" className={getNavLinkClass('discover')}>
                                Discover
                            </Link>
                            <Link href="/events" className={getNavLinkClass('events')}>
                                Events
                            </Link>
                            <Link href="/movies" className={getNavLinkClass('movies')}>
                                Movies
                            </Link>
                            <Link href="/screenplays" className={getNavLinkClass('screenplays')}>
                                Preproduction
                            </Link>
                            <Link href="/create" className="text-sm font-medium hover:text-primary">
                                Create
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-2">
                            {user ? (
                                <>
                                    <NotificationBell />
                                    <span className="text-sm text-muted-foreground hidden sm:block">
                                        Welcome, <Link href={user?.username ? `/${user.username}` : (user?.uid ? `/profile/${user.uid}` : '#')} className="underline hover:text-primary">{getFullName(user)}</Link>
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        Sign Out
                                    </Button>
                                    {showCreateButton && (
                                        <Button size="sm" asChild>
                                            <Link href="/create">Create</Link>
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                                        Sign In
                                    </Button>
                                    {showCreateButton && (
                                        <Button size="sm" asChild>
                                            <Link href="/create">Get Started</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
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

            {/* Name Modal */}
            {user && needsNameToProceed && (
                <GetUserNameModal onSubmit={handleNameSubmit} />
            )}
        </>
    );
}
