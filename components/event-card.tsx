'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPlaceholderDataUrl } from "@/lib/placeholder-svg";
import { Event } from "@/lib/types";
import { Calendar, Clock, DollarSign, Film, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
    event: Event;
    onClick?: () => void;
    showViewButton?: boolean;
}

export default function EventCard({ event, onClick, showViewButton = true }: EventCardProps) {
    const eventDate = new Date(event.date);
    const displayTime = event.time || "All day";

    return (
        <Card
            className={`overflow-hidden hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="relative h-48 w-full">
                <Image
                    src={event.imageUrl || createPlaceholderDataUrl('event', event.title, 300, 192)}
                    alt={event.title}
                    fill
                    className="object-cover"
                />
                {event.isMultiDay && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                        {event.numberOfDays} days
                    </Badge>
                )}
                {event.isMoviePremiere && (
                    <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700" variant="default">
                        <Film className="w-3 h-3 mr-1" />
                        Movie Premiere
                    </Badge>
                )}
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                {event.description && (
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {eventDate.toLocaleDateString()}
                    </div>
                    {event.time && (
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {displayTime}
                        </div>
                    )}
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Created by {event.creatorName}
                    </div>
                    {event.price && (
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Price: {event.price}</span>
                        </div>
                    )}
                    {event.isMoviePremiere && event.trailerUrl && (
                        <div className="text-sm">
                            <a
                                href={event.trailerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 font-medium flex items-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Film className="w-4 h-4 mr-1" />
                                Watch Trailer
                            </a>
                        </div>
                    )}
                </div>
                {showViewButton && (
                    <Button className="w-full mt-4" asChild onClick={(e) => e.stopPropagation()}>
                        <Link href={`/events/${event.id}`}>View Event</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
