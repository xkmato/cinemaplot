import {
    getUsersWithUnreadNotifications,
    getUserUnreadNotifications,
    NotificationDigestData,
    sendDailyNotificationDigest
} from '@/lib/notification-email-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sendToAll } = body;

    if (!userId && !sendToAll) {
      return NextResponse.json(
        { error: 'Either userId or sendToAll flag is required' },
        { status: 400 }
      );
    }

    console.log('Testing notification digest email...');

    if (sendToAll) {
      // Send to all users with unread notifications
      const usersWithUnread = await getUsersWithUnreadNotifications();
      
      if (usersWithUnread.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No users with unread notifications found',
          result: { sent: 0, failed: 0, total: 0 }
        });
      }

      let sent = 0;
      let failed = 0;

      for (const user of usersWithUnread) {
        try {
          const unreadNotifications = await getUserUnreadNotifications(user.uid);
          
          if (unreadNotifications.length > 0) {
            const digestData: NotificationDigestData = {
              user,
              notifications: unreadNotifications,
              unreadCount: unreadNotifications.length,
            };
            
            const success = await sendDailyNotificationDigest(digestData);
            if (success) {
              sent++;
            } else {
              failed++;
            }
          }
          
          // Small delay between emails
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to send test digest to user ${user.uid}:`, error);
          failed++;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Test notification digests processed',
        result: { sent, failed, total: usersWithUnread.length }
      });
    } else {
      // Send to specific user
      const unreadNotifications = await getUserUnreadNotifications(userId);

      if (unreadNotifications.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No unread notifications found for this user',
          result: { sent: 0, failed: 0, total: 0 }
        });
      }

      // Get user data - you'd need to implement this based on your user storage
      // For now, creating a minimal user object
      const testUser = {
        uid: userId,
        email: 'test@example.com', // You should fetch this from your user database
        displayName: 'Test User',
      };

      const digestData: NotificationDigestData = {
        user: testUser,
        notifications: unreadNotifications,
        unreadCount: unreadNotifications.length,
      };

      const success = await sendDailyNotificationDigest(digestData);

      return NextResponse.json({
        success: true,
        message: success ? 'Test notification digest sent successfully' : 'Failed to send test notification digest',
        result: { sent: success ? 1 : 0, failed: success ? 0 : 1, total: 1 }
      });
    }
  } catch (error) {
    console.error('Error in test notification digest:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get stats about users with unread notifications
    const usersWithUnread = await getUsersWithUnreadNotifications();
    
    const stats = {
      totalUsersWithUnread: usersWithUnread.length,
      users: usersWithUnread.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        // Note: We don't fetch notification count here to keep it fast
      }))
    };

    return NextResponse.json({
      success: true,
      message: 'Notification digest test stats',
      stats
    });
  } catch (error) {
    console.error('Error getting notification digest stats:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
