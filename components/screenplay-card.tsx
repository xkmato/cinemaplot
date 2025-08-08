'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Screenplay } from "@/lib/types";
import { FileText, MessageCircle, Star, User } from "lucide-react";
import Link from "next/link";

interface ScreenplayCardProps {
    screenplay: Screenplay;
}

export default function ScreenplayCard({ screenplay }: ScreenplayCardProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="line-clamp-2 text-lg">{screenplay.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                            {screenplay.logLine}
                        </CardDescription>
                    </div>
                    <div className="ml-4">
                        <FileText className="w-8 h-8 text-primary/60" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    {screenplay.genre && (
                        <Badge variant="secondary" className="text-xs">
                            {screenplay.genre}
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                        {screenplay.pageCount ? `${screenplay.pageCount} pages` : 'Processing...'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">
                    {/* Creator Info */}
                    <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        {screenplay.creatorName}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                {screenplay.averageRating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {screenplay.totalComments || 0}
                            </div>
                        </div>
                        <div className="text-xs">
                            {formatFileSize(screenplay.fileSize)}
                        </div>
                    </div>

                    {/* Synopsis Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {screenplay.synopsis}
                    </p>

                    {/* Action Button */}
                    <Button className="w-full" asChild>
                        <Link href={`/screenplays/${screenplay.id}`}>
                            View Project
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
