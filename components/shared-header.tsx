'use client';

import AuthScreen from "@/components/auth-screen";
import GetUserNameModal from "@/components/get-user-name-modal";
import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/auth-context";
import { getFullName } from "@/lib/helpers";
import { Menu, X, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface SharedHeaderProps {
    showCreateButton?: boolean;
    className?: string;
    currentPage?: 'home' | 'discover' | 'events' | 'movies' | 'screenplays';
}

export default function SharedHeader({ showCreateButton = true, className = "", currentPage = 'home' }: SharedHeaderProps) {
    const { user, needsNameToProceed, handleNameSubmit, handleLogout } = useAppContext();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const getNavLinkClass = (page: string) => {
        return currentPage === page
            ? "text-sm font-medium text-primary"
            : "text-sm font-medium hover:text-primary";
    };

    // Close mobile menu when clicking outside or on a link
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu();
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Handle clicks outside the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                closeMobileMenu();
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

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

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </Button>
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" aria-hidden="true">
                    <div
                        ref={mobileMenuRef}
                        className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation menu"
                    >
                        <div className="flex flex-col h-full">
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                        <Play className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <span className="text-xl font-bold">CinemaPlot</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeMobileMenu}
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Mobile Navigation Links */}
                            <nav className="flex-1 px-4 py-6">
                                <div className="space-y-4">
                                    <Link
                                        href="/discover"
                                        className={`block py-3 px-4 rounded-md transition-colors ${getNavLinkClass('discover')} hover:bg-muted`}
                                        onClick={closeMobileMenu}
                                    >
                                        Discover
                                    </Link>
                                    <Link
                                        href="/events"
                                        className={`block py-3 px-4 rounded-md transition-colors ${getNavLinkClass('events')} hover:bg-muted`}
                                        onClick={closeMobileMenu}
                                    >
                                        Events
                                    </Link>
                                    <Link
                                        href="/movies"
                                        className={`block py-3 px-4 rounded-md transition-colors ${getNavLinkClass('movies')} hover:bg-muted`}
                                        onClick={closeMobileMenu}
                                    >
                                        Movies
                                    </Link>
                                    <Link
                                        href="/screenplays"
                                        className={`block py-3 px-4 rounded-md transition-colors ${getNavLinkClass('screenplays')} hover:bg-muted`}
                                        onClick={closeMobileMenu}
                                    >
                                        Preproduction
                                    </Link>
                                    <Link
                                        href="/create"
                                        className="block py-3 px-4 rounded-md transition-colors text-sm font-medium hover:text-primary hover:bg-muted"
                                        onClick={closeMobileMenu}
                                    >
                                        Create
                                    </Link>
                                </div>

                                {/* User Actions */}
                                <div className="mt-8 pt-6 border-t">
                                    {user ? (
                                        <div className="space-y-4">
                                            <div className="px-4 py-2 text-sm text-muted-foreground">
                                                Welcome, <Link
                                                    href={user?.username ? `/${user.username}` : (user?.uid ? `/profile/${user.uid}` : '#')}
                                                    className="underline hover:text-primary"
                                                    onClick={closeMobileMenu}
                                                >
                                                    {getFullName(user)}
                                                </Link>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    handleLogout();
                                                    closeMobileMenu();
                                                }}
                                            >
                                                Sign Out
                                            </Button>
                                            {showCreateButton && (
                                                <Button className="w-full" asChild>
                                                    <Link href="/create" onClick={closeMobileMenu}>Create</Link>
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setShowAuthModal(true);
                                                    closeMobileMenu();
                                                }}
                                            >
                                                Sign In
                                            </Button>
                                            {showCreateButton && (
                                                <Button className="w-full" asChild>
                                                    <Link href="/create" onClick={closeMobileMenu}>Get Started</Link>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </div>
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
