'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/lib/auth-context";
import { NotificationService } from "@/lib/notification-service";
import { Notification } from "@/lib/types";
import { Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationBell() {
    const { user } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Subscribe to notifications
    useEffect(() => {
        if (!user?.uid) return;

        console.log('Setting up notification subscriptions for user:', user.uid);

        const unsubscribeNotifications = NotificationService.subscribeToUserNotifications(
            user.uid,
            (notifications) => {
                console.log('Received notifications:', notifications);
                setNotifications(notifications);
            }
        );

        const unsubscribeUnreadCount = NotificationService.subscribeToUnreadCount(
            user.uid,
            (count) => {
                console.log('Received unread count:', count);
                setUnreadCount(count);
            }
        );

        return () => {
            unsubscribeNotifications();
            unsubscribeUnreadCount();
        };
    }, [user?.uid]);

    const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
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
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return created.toLocaleDateString();
    };

    if (!user) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-auto p-1 text-xs"
                        >
                            <CheckCheck className="w-3 h-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        <div className="space-y-0">
                            {notifications.slice(0, 20).map((notification) => (
                                <div key={notification.id} className="relative">
                                    <Link
                                        href={getEntityPath(notification)}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                NotificationService.markAsRead(notification.id);
                                            }
                                            setIsOpen(false);
                                        }}
                                        className="block p-3 hover:bg-muted/50 border-b border-border/50 relative"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-1 pr-2">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            className="h-auto p-1 ml-2 shrink-0"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                                        )}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        {notifications.length > 20 && (
                            <div className="border-t">
                                <Link
                                    href="/notifications"
                                    className="block text-center p-3 text-sm text-primary hover:text-primary/80 hover:bg-muted/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-0">
                            <Link
                                href="/notifications"
                                className="block text-center p-3 text-sm text-primary hover:text-primary/80 hover:bg-muted/20"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
