'use client';

import { createPlaceholderDataUrl } from "@/lib/placeholder-svg";
import { Movie } from "@/lib/types";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <Link href={`/movies/${movie.id}`}>
                <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                    <Image
                        src={movie.imageUrl || createPlaceholderDataUrl('movie', movie.title, 300, 400)}
                        alt={movie.title}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                    />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                        {movie.logLine}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                        <span>{movie.category}</span>
                        <span>{movie.duration}</span>
                    </div>

                    {/* Rating */}
                    {movie.averageRating && movie.totalRatings && (
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{movie.averageRating.toFixed(1)}</span>
                            <span className="ml-1">({movie.totalRatings})</span>
                        </div>
                    )}

                    {/* Tags */}
                    {movie.tags && movie.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {movie.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                        by {movie.creatorName}
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}
