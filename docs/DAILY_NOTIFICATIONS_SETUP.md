# Daily Notification Email System

This document explains how to set up and configure the daily notification email system for CinemaPlot users.

## Overview

The system sends daily email digests to users who have unread notifications. Emails are sent at 5 PM daily, containing a summary of all unread notifications with links to view the full content.

## Features

- **Smart Filtering**: Only sends emails to users who actually have unread notifications
- **Rate Limiting**: Includes delays between emails to avoid overwhelming the email service
- **Rich Content**: HTML emails with beautiful formatting and direct links to notifications
- **Fallback Text**: Plain text version for email clients that don't support HTML
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Optional API key authentication for cron endpoints

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Required: Mailgun configuration (already configured)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=notifications@yourdomain.com

# Optional: API key for securing cron endpoints
CRON_API_KEY=your_secure_random_api_key

# Required: Base URL for links in emails
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Deployment Options

#### Option A: Vercel Cron Jobs (Recommended for Vercel deployments)

Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-notifications",
      "schedule": "0 17 * * *"
    }
  ]
}
```

#### Option B: External Cron Service (Recommended for other deployments)

Use a service like:

- **cron-job.org** (free)
- **EasyCron**
- **Crontab Guru**

Configure them to call:

- URL: `https://yourdomain.com/api/cron/daily-notifications`
- Method: `POST`
- Schedule: `0 17 * * *` (5 PM daily)
- Headers: `Authorization: Bearer YOUR_CRON_API_KEY` (if using API key)

#### Option C: Server Cron Job

If you have server access, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (replace with your domain and API key)
0 17 * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_API_KEY" https://yourdomain.com/api/cron/daily-notifications
```

### 3. Testing

#### Test the notification digest system:

```bash
# Get stats about users with unread notifications
curl https://yourdomain.com/api/test/notification-digest

# Send test digest to all users with unread notifications
curl -X POST https://yourdomain.com/api/test/notification-digest \
  -H "Content-Type: application/json" \
  -d '{"sendToAll": true}'

# Send test digest to specific user (replace USER_ID)
curl -X POST https://yourdomain.com/api/test/notification-digest \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}'
```

#### Test the production cron endpoint:

```bash
# Without API key
curl -X POST https://yourdomain.com/api/cron/daily-notifications

# With API key
curl -X POST https://yourdomain.com/api/cron/daily-notifications \
  -H "Authorization: Bearer YOUR_CRON_API_KEY"
```

## API Endpoints

### `/api/cron/daily-notifications` (POST)

**Purpose**: Production endpoint for daily digest emails
**Authentication**: Optional Bearer token via `CRON_API_KEY`
**Response**: Statistics about emails sent

### `/api/test/notification-digest` (GET)

**Purpose**: Get statistics about users with unread notifications
**Response**: Count and list of users who would receive emails

### `/api/test/notification-digest` (POST)

**Purpose**: Send test notification digests
**Body Options**:

- `{"sendToAll": true}` - Send to all users with unread notifications
- `{"userId": "USER_ID"}` - Send to specific user

## Email Content

### HTML Email Features:

- Professional design matching CinemaPlot branding
- Up to 10 most recent notifications displayed
- Direct links to view notifications
- Responsive design for mobile devices
- Unsubscribe and settings links

### Plain Text Fallback:

- Simple, readable format
- All notification content included
- Direct links to notifications page

## Monitoring and Logs

The system logs all activity:

- Number of users with unread notifications
- Success/failure rates for email sending
- Individual user email results
- Error details for debugging

Check your application logs for entries prefixed with:

- `Daily notification digest process`
- `Sending daily notification digest`

## Customization

### Email Timing

To change the time, modify the cron schedule:

- `0 17 * * *` = 5 PM daily
- `0 9 * * *` = 9 AM daily
- `0 20 * * 1-5` = 8 PM on weekdays only

### Email Content

Edit `/lib/notification-email-service.ts`:

- `createNotificationDigestHTML()` - HTML email template
- `createNotificationDigestText()` - Plain text template

### Rate Limiting

Adjust the delay between emails in `sendDailyNotificationDigests()`:

```javascript
// Current: 1 second delay
await new Promise((resolve) => setTimeout(resolve, 1000));
```

## Security Considerations

1. **API Key Protection**: Use the `CRON_API_KEY` environment variable to secure your cron endpoints
2. **Rate Limiting**: Built-in delays prevent overwhelming your email service
3. **Error Handling**: Failed emails don't crash the entire process
4. **Data Privacy**: Only processes users who have unread notifications

## Troubleshooting

### No emails being sent:

1. Check Mailgun configuration in environment variables
2. Verify users have unread notifications: `GET /api/test/notification-digest`
3. Check application logs for error messages

### Cron job not running:

1. Verify cron schedule syntax
2. Check if your hosting provider supports cron jobs
3. Test the endpoint manually with curl

### Email delivery issues:

1. Check Mailgun dashboard for delivery statistics
2. Verify your domain is properly configured in Mailgun
3. Check recipient spam folders

## Future Enhancements

Potential improvements:

- User preference settings for digest frequency
- Email templates for different notification types
- Analytics and open/click tracking
- Bulk unsubscribe management
- A/B testing for email content
