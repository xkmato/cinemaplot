'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/auth-context";
import { NotificationService } from "@/lib/notification-service";
import { Notification } from "@/lib/types";
import { ArrowLeft, Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
    const { user } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Subscribe to notifications
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const unsubscribeNotifications = NotificationService.subscribeToUserNotifications(
            user.uid,
            (notifications) => {
                setNotifications(notifications);
                setLoading(false);
            }
        );

        const unsubscribeUnreadCount = NotificationService.subscribeToUnreadCount(
            user.uid,
            (count) => {
                setUnreadCount(count);
            }
        );

        return () => {
            unsubscribeNotifications();
            unsubscribeUnreadCount();
        };
    }, [user?.uid]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationService.markAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Mark all unread notifications as read
            const unreadNotifications = notifications.filter(n => !n.isRead);
            await Promise.all(
                unreadNotifications.map(notification =>
                    NotificationService.markAsRead(notification.id)
                )
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getEntityPath = (notification: Notification): string => {
        switch (notification.entityType) {
            case 'event':
                return `/events/${notification.entityId}`;
            case 'movie':
                return `/movies/${notification.entityId}`;
            case 'screenplay':
                return `/screenplays/${notification.entityId}`;
            default:
                return '/';
        }
    };

    const formatTimeAgo = (createdAt: string): string => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return created.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'event_followed':
                return '👥';
            case 'event_comment':
                return '💬';
            case 'audition_tape_submitted':
                return '🎬';
            case 'movie_rated':
            case 'movie_reviewed':
                return '⭐';
            case 'screenplay_commented':
                return '📝';
            default:
                return '🔔';
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <CardTitle>Sign In Required</CardTitle>
                            <CardDescription>
                                Please sign in to view your notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Link href="/">
                                <Button>Go to Homepage</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Bell className="w-6 h-6" />
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-lg">Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <CardTitle>No notifications yet</CardTitle>
                            <CardDescription>
                                When you receive notifications about your events, movies, and screenplays, they&apos;ll appear here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Link href="/">
                                <Button>Explore Content</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`transition-all hover:shadow-md ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-primary rounded-full ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{formatTimeAgo(notification.createdAt)}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {notification.entityType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Link href={getEntityPath(notification)}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!notification.isRead) {
                                                            handleMarkAsRead(notification.id);
                                                        }
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
