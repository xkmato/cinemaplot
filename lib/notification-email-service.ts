import { collection, getDocs, query, where } from 'firebase/firestore';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { appId, db } from './firebase';
import { Notification } from './types';

// Initialize Mailgun
const mailgun = new Mailgun(FormData);

let mg: ReturnType<typeof mailgun.client> | null = null;

function getMailgunClient() {
  if (!mg) {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      throw new Error('Mailgun configuration missing. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
    }

    mg = mailgun.client({
      username: 'api',
      key: apiKey,
    });
  }
  
  return mg;
}

export interface UserWithEmail {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface NotificationDigestData {
  user: UserWithEmail;
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Get all unread notifications for a specific user
 */
export async function getUserUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    
    // Sort by creation date (newest first)
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
}

/**
 * Get all users who have unread notifications
 */
export async function getUsersWithUnreadNotifications(): Promise<UserWithEmail[]> {
  try {
    // First, get all users from the users collection
    const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
    const usersSnapshot = await getDocs(usersRef);
    
    const usersWithEmail: UserWithEmail[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) {
        usersWithEmail.push({
          uid: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
        });
      }
    });
    
    // Filter users who have unread notifications
    const usersWithUnread: UserWithEmail[] = [];
    
    for (const user of usersWithEmail) {
      const unreadNotifications = await getUserUnreadNotifications(user.uid);
      if (unreadNotifications.length > 0) {
        usersWithUnread.push(user);
      }
    }
    
    return usersWithUnread;
  } catch (error) {
    console.error('Error fetching users with unread notifications:', error);
    return [];
  }
}

/**
 * Send daily notification digest email to a user
 */
export async function sendDailyNotificationDigest(digestData: NotificationDigestData): Promise<boolean> {
  try {
    console.log('Sending daily notification digest to:', digestData.user.email);
    
    const client = getMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL || `notifications@${domain}`;
    
    // Determine the name to use
    const name = digestData.user.firstName || 
                digestData.user.displayName || 
                digestData.user.username || 
                'Film Creator';
    
    // Create the email content
    const htmlContent = createNotificationDigestHTML(name, digestData);
    const textContent = createNotificationDigestText(name, digestData);
    
    const subject = digestData.unreadCount === 1 
      ? 'You have 1 unread notification on CinemaPlot'
      : `You have ${digestData.unreadCount} unread notifications on CinemaPlot`;

    const messageData = {
      from: `CinemaPlot Notifications <${fromEmail}>`,
      to: digestData.user.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
      'o:tag': ['daily-digest', 'notifications'],
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true,
    };

    console.log('Sending notification digest with data:', { 
      from: messageData.from, 
      to: messageData.to, 
      subject: messageData.subject,
      notificationCount: digestData.unreadCount,
      domain 
    });

    const response = await client.messages.create(domain, messageData);
    
    console.log('Daily notification digest sent successfully:', response.id);
    return true;
  } catch (error) {
    console.error('Failed to send daily notification digest - detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Send daily notification digests to all users with unread notifications
 */
export async function sendDailyNotificationDigests(): Promise<{ sent: number; failed: number; total: number }> {
  try {
    console.log('Starting daily notification digest process...');
    
    const usersWithUnread = await getUsersWithUnreadNotifications();
    console.log(`Found ${usersWithUnread.length} users with unread notifications`);
    
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
        
        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send digest to user ${user.uid}:`, error);
        failed++;
      }
    }
    
    const total = usersWithUnread.length;
    console.log(`Daily notification digest process completed. Sent: ${sent}, Failed: ${failed}, Total: ${total}`);
    
    return { sent, failed, total };
  } catch (error) {
    console.error('Error in daily notification digest process:', error);
    return { sent: 0, failed: 0, total: 0 };
  }
}

function createNotificationDigestHTML(name: string, digestData: NotificationDigestData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cinemaplot.com';
  const notificationsUrl = `${baseUrl}/notifications`;
  const unsubscribeUrl = `${baseUrl}/notifications/settings`; // You might want to create this page
  
  const notificationItems = digestData.notifications
    .slice(0, 10) // Limit to 10 most recent notifications
    .map(notification => {
      const entityUrl = getEntityUrl(baseUrl, notification);
      const timeAgo = getTimeAgo(notification.createdAt);
      
      return `
        <div style="border-left: 4px solid #667eea; padding: 15px; margin-bottom: 15px; background-color: #f8f9fa; border-radius: 0 8px 8px 0;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between;">
            <div style="flex-grow: 1;">
              <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px; font-weight: 600;">
                ${notification.title}
              </h4>
              <p style="margin: 0 0 8px 0; color: #555; font-size: 14px; line-height: 1.4;">
                ${notification.message}
              </p>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #999; font-size: 12px;">${timeAgo}</span>
                ${entityUrl ? `<a href="${entityUrl}" style="color: #667eea; text-decoration: none; font-size: 12px; font-weight: 500;">View →</a>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

  const hasMoreNotifications = digestData.notifications.length > 10;
  const moreNotificationsText = hasMoreNotifications 
    ? `<p style="text-align: center; margin: 20px 0; color: #666;">+ ${digestData.notifications.length - 10} more notifications</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily CinemaPlot Notifications</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600;
        }
        .header p { 
            margin: 8px 0 0 0; 
            opacity: 0.9; 
            font-size: 14px;
        }
        .content { 
            padding: 30px; 
        }
        .summary {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
        }
        .summary h2 {
            margin: 0 0 8px 0;
            color: #667eea;
            font-size: 20px;
        }
        .summary p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .notifications {
            margin: 25px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 14px;
            margin: 10px 5px;
            text-align: center;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #e9ecef;
        }
        .footer a { 
            color: #667eea; 
            text-decoration: none; 
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .header, .content { padding: 20px; }
            .header h1 { font-size: 20px; }
            .cta-button { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Your Daily Notifications</h1>
            <p>Stay up to date with your CinemaPlot activity</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <h2>Hello ${name}!</h2>
                <p>You have <strong>${digestData.unreadCount}</strong> unread notification${digestData.unreadCount === 1 ? '' : 's'} waiting for you.</p>
            </div>
            
            <div class="notifications">
                ${notificationItems}
                ${moreNotificationsText}
            </div>
            
            <div class="cta-section">
                <p style="margin: 0 0 15px 0; color: #555;">Stay connected with your film community:</p>
                <a href="${notificationsUrl}" class="cta-button">View All Notifications</a>
                <a href="${baseUrl}" class="cta-button">Visit CinemaPlot</a>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 CinemaPlot. All rights reserved.</p>
            <p>
                <a href="${unsubscribeUrl}">Notification Settings</a> • 
                <a href="${baseUrl}/privacy-policy">Privacy Policy</a>
            </p>
            
            <p style="font-size: 11px; color: #999; margin-top: 15px;">
                You received this email because you have unread notifications on CinemaPlot. 
                These emails are sent daily at 5 PM if you have unread notifications.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

function createNotificationDigestText(name: string, digestData: NotificationDigestData): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cinemaplot.com';
  const notificationsUrl = `${baseUrl}/notifications`;
  
  let notificationText = digestData.notifications
    .slice(0, 10)
    .map((notification, index) => {
      const timeAgo = getTimeAgo(notification.createdAt);
      return `${index + 1}. ${notification.title}\n   ${notification.message}\n   ${timeAgo}`;
    }).join('\n\n');

  const hasMoreNotifications = digestData.notifications.length > 10;
  if (hasMoreNotifications) {
    notificationText += `\n\n+ ${digestData.notifications.length - 10} more notifications`;
  }

  return `
Your Daily CinemaPlot Notifications

Hello ${name}!

You have ${digestData.unreadCount} unread notification${digestData.unreadCount === 1 ? '' : 's'} waiting for you:

${notificationText}

View all notifications: ${notificationsUrl}
Visit CinemaPlot: ${baseUrl}

---
© 2025 CinemaPlot. All rights reserved.

You received this email because you have unread notifications on CinemaPlot. 
These emails are sent daily at 5 PM if you have unread notifications.
`;
}

function getEntityUrl(baseUrl: string, notification: Notification): string | null {
  switch (notification.entityType) {
    case 'event':
      return `${baseUrl}/events/${notification.entityId}`;
    case 'movie':
      return `${baseUrl}/movies/${notification.entityId}`;
    case 'screenplay':
      return `${baseUrl}/screenplays/${notification.entityId}`;
    default:
      return null;
  }
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 7) {
    return date.toLocaleDateString();
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    return 'Less than an hour ago';
  }
}
