'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { Calendar, Clock, DollarSign, Link as LinkIcon, MapPin, Play, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

export default function EventDetailPage() {
  const { events, isLoading } = useAppContext();
  const params = useParams();
  const eventId = params.id as string;

  if (isLoading) {
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
              <Button variant="outline" asChild>
                <Link href="/discover">Back to Discover</Link>
              </Button>
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

  const event = events.find(e => e.id === eventId);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);
  const isMultiDay = event.isMultiDay && event.numberOfDays && event.numberOfDays > 1;
  const endDate = isMultiDay ? new Date(event.endDate!) : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

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
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" asChild>
                <Link href="/discover">Back to Discover</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Event Image */}
            {event.imageUrl && (
              <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                {isMultiDay && (
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    {event.numberOfDays} days
                  </Badge>
                )}
              </div>
            )}

            {/* Event Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
                <p className="text-lg text-muted-foreground">
                  Created by {event.creatorName}
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {eventDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {isMultiDay && endDate && (
                        <span> - {endDate.toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      )}
                    </p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <p>{event.time}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>

                {event.price && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <p>{event.price}</p>
                  </div>
                )}

                {event.timezone && (
                  <div className="text-sm text-muted-foreground">
                    Times shown in {event.timezone}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {event.eventLink && (
                  <Button className="w-full" asChild>
                    <a href={event.eventLink} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Join Event
                    </a>
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Follow Creator
                </Button>
              </div>
            </div>
          </div>

          {/* Event Description */}
          {event.description && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{event.creatorName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Event Creator
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
