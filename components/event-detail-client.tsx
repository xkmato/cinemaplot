'use client';

import AddAuditionRoles from "@/components/add-audition-roles";
import AuditionTapeManager from "@/components/audition-tape-manager";
import SubmitAuditionTape from "@/components/submit-audition-tape";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { appId, db } from "@/lib/firebase";
import { createPlaceholderDataUrl } from "@/lib/placeholder-svg";
import { generateEventStructuredData } from "@/lib/seo";
import { AuditionRole, Event } from "@/lib/types";
import { shouldUseUnoptimized } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { Bell, Calendar, Clapperboard, DollarSign, Heart, MapPin, MessageCircle, Plus, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface EventDetailClientProps {
    eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
    const { events, isLoading, followEvent, unfollowEvent, isFollowingEvent, user, submitComment, getEventComments, updateEvent } = useAppContext();
    const [showComments, setShowComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [singleEvent, setSingleEvent] = useState<Event | null>(null);
    const [isFetchingEvent, setIsFetchingEvent] = useState(false);
    const [eventNotFound, setEventNotFound] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showSubmitTapeModal, setShowSubmitTapeModal] = useState(false);
    const [showTapeManagerModal, setShowTapeManagerModal] = useState(false);
    const [showAddRolesModal, setShowAddRolesModal] = useState(false);

    // Effect to fetch single event when events list is empty and we have an eventId
    useEffect(() => {
        const shouldFetchSingleEvent =
            eventId &&
            events.length === 0 &&
            !singleEvent &&
            !isFetchingEvent &&
            !eventNotFound;

        if (shouldFetchSingleEvent) {
            const fetchEvent = async () => {
                try {
                    setIsFetchingEvent(true);
                    const eventDocRef = doc(db, `artifacts/${appId}/public/data/events`, eventId);
                    const eventDoc = await getDoc(eventDocRef);

                    if (eventDoc.exists()) {
                        const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;

                        // Apply the same filtering logic as in the context
                        if (eventData.deleted) {
                            setEventNotFound(true);
                            return;
                        }
                        if (eventData.paused && (!user || user.uid !== eventData.creatorId)) {
                            setEventNotFound(true);
                            return;
                        }

                        setSingleEvent(eventData);
                    } else {
                        setEventNotFound(true);
                    }
                } catch (error) {
                    console.error('Error fetching event:', error);
                    setEventNotFound(true);
                } finally {
                    setIsFetchingEvent(false);
                }
            };

            fetchEvent();
        }
    }, [eventId, isLoading, events.length, singleEvent, isFetchingEvent, eventNotFound, user]);

    // Determine which event to use - from context or single fetch
    let currentEvent: Event | undefined;
    if (events.length > 0) {
        currentEvent = events.find(e => e.id === eventId);
    } else if (singleEvent) {
        currentEvent = singleEvent;
    }

    const isFollowing = currentEvent ? isFollowingEvent(eventId) : false;

    const handleFollowToggle = async () => {
        if (!user) {
            alert('Please sign in to follow events');
            return;
        }

        try {
            if (isFollowing) {
                await unfollowEvent(eventId);
            } else {
                await followEvent(eventId);
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    const handleCommentSubmit = async () => {
        if (!user) {
            alert('Please sign in to comment');
            return;
        }

        if (!commentText.trim()) {
            return;
        }

        try {
            setIsSubmittingComment(true);
            await submitComment(eventId, commentText.trim());
            setCommentText("");
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment. Please try again.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleSubmitAuditionTape = async (submission: { roleId: string; tapeUrl: string; notes?: string }) => {
        // TODO: Implement tape submission logic
        console.log('Submitting audition tape:', submission);
        // This would typically call an API to save the audition tape
        alert('Audition tape submitted successfully!');
        setShowSubmitTapeModal(false);
    };

    const handleUpdateTapeStatus = async (tapeId: string, status: 'submitted' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected', notes?: string) => {
        // TODO: Implement tape status update logic  
        console.log('Updating tape status:', { tapeId, status, notes });
        // This would typically call an API to update the tape status
        alert(`Tape status updated to ${status}`);
    };

    const handleAddRolesToAudition = async (eventId: string, newRoles: AuditionRole[]) => {
        try {
            // Get the current event to merge with existing roles
            const currentEvent = events.find(event => event.id === eventId) || singleEvent;
            if (!currentEvent) {
                throw new Error('Audition event not found');
            }

            const existingRoles = currentEvent.auditionRoles || [];
            const updatedRoles = [...existingRoles, ...newRoles];

            await updateEvent(eventId, { auditionRoles: updatedRoles });

            // Update local state
            if (singleEvent) {
                setSingleEvent(prev => prev ? { ...prev, auditionRoles: updatedRoles } : null);
            }

            // Close the modal after successful addition
            setShowAddRolesModal(false);
        } catch (error) {
            console.error('Failed to add roles to audition:', error);
            // Let the modal handle error display
            throw error;
        }
    };

    // Show loading if we're still loading context or fetching a single event
    if (isLoading || isFetchingEvent) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-lg font-semibold hover:text-primary">
                                ← Back to Home
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-lg">Loading event...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show 404 if we've determined the event doesn't exist
    if (eventNotFound || (!isLoading && !isFetchingEvent && !currentEvent)) {
        notFound();
    }

    // If we still don't have an event, show loading
    if (!currentEvent) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-lg font-semibold hover:text-primary">
                                ← Back to Home
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-lg">Loading event...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Mock data structure matching the sample for missing fields
    const eventData = {
        id: currentEvent.id,
        title: currentEvent.title,
        description: currentEvent.description,
        category: "Event",
        date: currentEvent.date,
        location: currentEvent.location,
        price: currentEvent.price || "Free",
        followers: currentEvent.followers?.length || 0,
        image: currentEvent.imageUrl || createPlaceholderDataUrl('event', currentEvent.title, 800, 400),
        organizer: {
            name: currentEvent.creatorName || "Event Organizer",
            avatar: undefined as string | undefined,
            verified: true,
        },
        isPastEvent: false,
    };

    // Get real comments for this event
    const comments = getEventComments(eventId);

    // Utility function to format timestamp
    const formatTimestamp = (timestamp: string) => {
        const now = new Date();
        const commentDate = new Date(timestamp);
        const diffMs = now.getTime() - commentDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
            return diffMinutes <= 1 ? "just now" : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
        } else {
            return commentDate.toLocaleDateString();
        }
    };

    // Filter events happening on the same day (excluding current event)
    const eventDate = new Date(eventData.date);
    const sameDayEvents = events.filter(e => {
        if (e.id === eventData.id) return false; // Exclude current event
        const eDate = new Date(e.date);
        return eDate.toDateString() === eventDate.toDateString();
    }).slice(0, 3); // Take at most 3 events

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateEventStructuredData(currentEvent)),
                }}
            />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-lg font-semibold hover:text-primary">
                                ← Back to Home
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Image */}
                        <div className="relative mb-8">
                            <Image
                                src={eventData.image}
                                alt={eventData.title}
                                width={800}
                                height={400}
                                className="w-full h-64 md:h-96 object-cover rounded-lg"
                                unoptimized={eventData.image ? shouldUseUnoptimized(eventData.image) : false}
                            />
                            <Badge className="absolute top-4 left-4 text-sm">{eventData.category}</Badge>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Title and Organizer */}
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{eventData.title}</h1>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Avatar>
                                            <AvatarImage src={eventData.organizer.avatar || undefined} alt={eventData.organizer.name} />
                                            <AvatarFallback>{eventData.organizer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{eventData.organizer.name}</span>
                                                {eventData.organizer.verified && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground">Event Organizer</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-3">About This Event</h2>
                                    <p className="text-muted-foreground leading-relaxed">{eventData.description}</p>
                                </div>

                                {/* Audition Section - Only show for audition events */}
                                {currentEvent.type === 'audition' && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                                            <Clapperboard className="w-5 h-5 mr-2" />
                                            Audition Information
                                        </h2>

                                        {currentEvent.auditionRoles && currentEvent.auditionRoles.length > 0 ? (
                                            <div className="space-y-4">
                                                <h3 className="font-medium">Available Roles</h3>
                                                <div className="grid gap-4">
                                                    {currentEvent.auditionRoles.map((role, index) => (
                                                        <Card key={index} className="border-l-4 border-l-primary">
                                                            <CardContent className="pt-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold text-lg">{role.roleName}</h4>
                                                                        <p className="text-muted-foreground mb-2">{role.description}</p>
                                                                        <div className="flex flex-wrap gap-2 text-sm">
                                                                            {role.requirements && (
                                                                                <Badge variant="outline">
                                                                                    {role.requirements}
                                                                                </Badge>
                                                                            )}
                                                                            {role.numberOfSlots && (
                                                                                <Badge variant="outline">
                                                                                    {role.numberOfSlots} slots
                                                                                </Badge>
                                                                            )}
                                                                            {role.pageRanges && role.pageRanges.length > 0 && (
                                                                                <Badge variant="outline">
                                                                                    Pages: {role.pageRanges.map(range =>
                                                                                        range.startPage === range.endPage
                                                                                            ? `${range.startPage}`
                                                                                            : `${range.startPage}-${range.endPage}`
                                                                                    ).join(', ')}
                                                                                </Badge>
                                                                            )}
                                                                            {role.status && (
                                                                                <Badge variant={role.status === 'open' ? 'default' : role.status === 'filled' ? 'secondary' : 'outline'}>
                                                                                    {role.status}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                {/* Action Buttons for Auditions */}
                                                <div className="flex flex-wrap gap-3 pt-4">
                                                    {user?.uid === currentEvent.creatorId ? (
                                                        <>
                                                            <Button
                                                                onClick={() => setShowTapeManagerModal(true)}
                                                                className="flex items-center"
                                                            >
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Manage Audition Tapes
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setShowAddRolesModal(true)}
                                                                className="flex items-center"
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Add More Roles
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setShowSubmitTapeModal(true)}
                                                            className="flex items-center"
                                                        >
                                                            <Clapperboard className="w-4 h-4 mr-2" />
                                                            Submit Audition Tape
                                                        </Button>
                                                    )}

                                                    {currentEvent.screenplayId && (
                                                        <Button variant="outline" asChild>
                                                            <Link href={`/screenplays/${currentEvent.screenplayId}?eventId=${currentEvent.id}`}>
                                                                View Full Script
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-muted-foreground text-center py-4">
                                                        No audition roles have been defined for this event yet.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* Tags */}
                                {currentEvent.tags && currentEvent.tags.length > 0 && (
                                    <div>
                                        <h3 className="font-medium mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {currentEvent.tags.map((tag) => (
                                                <Badge key={tag} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comments Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold">Discussion</h3>
                                        <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            {comments.length} Comments
                                        </Button>
                                    </div>

                                    {showComments && (
                                        <div className="space-y-4">
                                            {user ? (
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <Textarea
                                                            placeholder="Share your thoughts about this event..."
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                        />
                                                        <Button
                                                            className="mt-2"
                                                            size="sm"
                                                            onClick={handleCommentSubmit}
                                                            disabled={isSubmittingComment || !commentText.trim()}
                                                        >
                                                            {isSubmittingComment ? "Posting..." : "Post Comment"}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            Please sign in to join the discussion
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {comments.length === 0 ? (
                                                <Card>
                                                    <CardContent className="pt-4">
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            No comments yet. Be the first to share your thoughts!
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                comments.map((comment) => (
                                                    <Card key={comment.id}>
                                                        <CardContent className="pt-4">
                                                            <div className="flex items-start space-x-3">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName} />
                                                                    <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className="font-medium text-sm">{comment.userName}</span>
                                                                        <span className="text-xs text-muted-foreground">{formatTimestamp(comment.createdAt)}</span>
                                                                    </div>
                                                                    <p className="text-sm">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Event Details Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Event Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">
                                                    {new Date(eventData.date).toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(eventData.date).toLocaleTimeString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Location</div>
                                                <div className="text-sm text-muted-foreground">{eventData.location}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">Price</div>
                                                <div className="text-sm text-muted-foreground">{eventData.price}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Users className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{eventData.followers} followers</div>
                                                <div className="text-sm text-muted-foreground">People interested</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <Card>
                                    <CardContent className="pt-6 space-y-3">
                                        <Button
                                            className="w-full"
                                            onClick={handleFollowToggle}
                                            variant={isFollowing ? "outline" : "default"}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <Bell className="w-4 h-4 mr-2" />
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <Heart className="w-4 h-4 mr-2" />
                                                    Follow Event
                                                </>
                                            )}
                                        </Button>

                                        <Button className="w-full bg-transparent" variant="outline" onClick={() => setShowShareModal(true)}>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share Event
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Happening That Day */}
                                {sameDayEvents.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Happening That Day</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {sameDayEvents.map((sameDayEvent) => (
                                                <Link key={sameDayEvent.id} href={`/events/${sameDayEvent.id}`}>
                                                    <div className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer">
                                                        {sameDayEvent.imageUrl ? (
                                                            <Image
                                                                src={sameDayEvent.imageUrl}
                                                                alt={sameDayEvent.title}
                                                                width={60}
                                                                height={60}
                                                                className="rounded-lg object-cover"
                                                                unoptimized={shouldUseUnoptimized(sameDayEvent.imageUrl)}
                                                            />
                                                        ) : (
                                                            <div className="w-[60px] h-[60px] bg-muted rounded-lg flex items-center justify-center">
                                                                <Calendar className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm line-clamp-2">{sameDayEvent.title}</div>
                                                            <div className="text-xs text-muted-foreground">{sameDayEvent.location}</div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Audition Tape Modal */}
            {showSubmitTapeModal && currentEvent.type === 'audition' && currentEvent.auditionRoles && (
                <SubmitAuditionTape
                    auditionEvent={currentEvent}
                    roles={currentEvent.auditionRoles}
                    onSubmit={handleSubmitAuditionTape}
                    onClose={() => setShowSubmitTapeModal(false)}
                />
            )}

            {/* Audition Tape Manager Modal */}
            {showTapeManagerModal && currentEvent.type === 'audition' && user?.uid === currentEvent.creatorId && (
                <AuditionTapeManager
                    auditionEvent={currentEvent}
                    tapes={[]} // TODO: Load actual tapes from state/API
                    roles={currentEvent.auditionRoles || []}
                    onUpdateTapeStatus={handleUpdateTapeStatus}
                    canReview={true}
                />
            )}

            {/* Add Audition Roles Modal */}
            {showAddRolesModal && currentEvent.type === 'audition' && user?.uid === currentEvent.creatorId && (
                <AddAuditionRoles
                    event={currentEvent}
                    onClose={() => setShowAddRolesModal(false)}
                    onAddRoles={handleAddRolesToAudition}
                />
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
                    <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-b from-card to-card/95 animate-in slide-in-from-bottom-4 duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold">Share Event</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowShareModal(false)}
                                    className="h-8 w-8 p-0 rounded-full"
                                >
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
                                <Image
                                    src={eventData.image}
                                    alt={eventData.title}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                    unoptimized={eventData.image ? shouldUseUnoptimized(eventData.image) : false}
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium line-clamp-1">{eventData.title}</h3>
                                    <p className="text-sm text-muted-foreground">by {eventData.organizer.name}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="text-sm text-muted-foreground flex-1 truncate mr-2">
                                        {typeof window !== 'undefined' ? window.location.href : ''}
                                    </span>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                navigator.clipboard.writeText(window.location.href);
                                            }
                                        }}
                                    >
                                        Copy Link
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                                            const text = encodeURIComponent(`Check out "${eventData.title}" by ${eventData.organizer.name}`);
                                            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                                        }}
                                    >
                                        Twitter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                        }}
                                    >
                                        Facebook
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                                            const title = encodeURIComponent(`${eventData.title} by ${eventData.organizer.name}`);
                                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
                                        }}
                                    >
                                        LinkedIn
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: eventData.title,
                                                    text: `Check out "${eventData.title}" by ${eventData.organizer.name}`,
                                                    url: typeof window !== 'undefined' ? window.location.href : '',
                                                });
                                            }
                                        }}
                                    >
                                        More
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
