'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/auth-context";
import { appId, db } from "@/lib/firebase";
import { Event } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { Bell, Calendar, DollarSign, ExternalLink, Heart, MapPin, MessageCircle, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventDetailPage() {
  const { events, isLoading, followEvent, unfollowEvent, isFollowingEvent, user } = useAppContext();
  const params = useParams();
  const eventId = params.id as string;
  const [showComments, setShowComments] = useState(false);
  const [singleEvent, setSingleEvent] = useState<Event | null>(null);
  const [isFetchingEvent, setIsFetchingEvent] = useState(false);
  const [eventNotFound, setEventNotFound] = useState(false);
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
          console.log('Fetched event:', eventDoc.id, eventDoc.data());

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
    console.log('Using context events:', events);
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
                <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm">
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
    ticketingLink: currentEvent.eventLink || "https://eventbrite.com/tech-conf-2024",
    image: currentEvent.imageUrl || "/placeholder.svg?height=400&width=800",
    organizer: {
      name: currentEvent.creatorName || "Event Organizer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    tags: ["Technology", "Networking", "Innovation", "AI", "Startups"],
    isPastEvent: false,
  };

  const comments = [
    {
      id: 1,
      user: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
      content: "Really excited for this event! The speaker lineup looks amazing.",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      content: "Will there be recordings available for those who can't attend in person?",
      timestamp: "5 hours ago",
    },
  ];

  // Filter events happening on the same day (excluding current event)
  const eventDate = new Date(eventData.date);
  const sameDayEvents = events.filter(e => {
    if (e.id === eventData.id) return false; // Exclude current event
    const eDate = new Date(e.date);
    return eDate.toDateString() === eventDate.toDateString();
  }).slice(0, 3); // Take at most 3 events

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
              <Button variant="outline" size="sm">
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
              src={eventData.image || "/placeholder.svg"}
              alt={eventData.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
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
                    <AvatarImage src={eventData.organizer.avatar || "/placeholder.svg"} alt={eventData.organizer.name} />
                    <AvatarFallback>EO</AvatarFallback>
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

              {/* Tags */}
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {eventData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

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
                    <Card>
                      <CardContent className="pt-4">
                        <Textarea placeholder="Share your thoughts about this event..." />
                        <Button className="mt-2" size="sm">
                          Post Comment
                        </Button>
                      </CardContent>
                    </Card>

                    {comments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{comment.user.name}</span>
                                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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

                  {eventData.ticketingLink && (
                    <Button className="w-full bg-transparent" variant="outline" asChild>
                      <a href={eventData.ticketingLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Get Tickets
                      </a>
                    </Button>
                  )}

                  <Button className="w-full bg-transparent" variant="outline">
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
  );
}
