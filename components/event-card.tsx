'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/lib/types";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
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
            {event.imageUrl && (
                <div className="relative h-48 w-full">
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                    {event.isMultiDay && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                            {event.numberOfDays} days
                        </Badge>
                    )}
                </div>
            )}
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
                        <div className="text-sm font-medium text-primary">
                            {event.price}
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
