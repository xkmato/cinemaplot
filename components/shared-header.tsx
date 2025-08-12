'use client';

import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/auth-context";
import { getFullName } from "@/lib/helpers";
import { Play } from "lucide-react";
import Link from "next/link";

interface SharedHeaderProps {
    showCreateButton?: boolean;
    className?: string;
}

export default function SharedHeader({ showCreateButton = true, className = "" }: SharedHeaderProps) {
    const { user, handleLogout } = useAppContext();

    return (
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
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/?signin=true">Sign In</Link>
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
    );
}
