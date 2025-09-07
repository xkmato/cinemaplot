# Audition Tape Email Confirmation & Notification System

## Overview

This comprehensive feature automatically sends email confirmations to people who submit audition tapes AND email notifications to event owners when they receive new audition submissions through CinemaPlot. This creates a complete communication loop for the audition process.

## What Changed

### 1. Enhanced Email Functions (`lib/email-service.ts`)

- **Added** `sendAuditionTapeConfirmationEmail()` - For submitters
- **Added** `sendAuditionTapeNotificationEmail()` - For event owners
- **Added** `getUserById()` - Helper to fetch user data including email
- **Added** `AuditionTapeConfirmationData` & `AuditionTapeNotificationData` interfaces
- Professional HTML email templates for both types with:
  - Confirmation that tape was received (submitter)
  - New submission alert with all details (event owner)
  - Clear 7-day expectation setting
  - Professional styling matching CinemaPlot branding

### 2. Updated Submission Process (`lib/auth-context.tsx`)

- Modified `submitAuditionTape()` function to send TWO emails:
  1. **Confirmation email** to the person who submitted the tape
  2. **Notification email** to the event owner about the new submission
- Fetches event owner details from database using their user ID
- Includes comprehensive error handling - submission won't fail if emails fail

### 3. Form Updates (`components/submit-audition-tape.tsx`)

- Made email address required (was previously optional)
- Added helpful text: "We'll send you a confirmation email when your tape is received"
- Updated form validation to require email
- Added basic email format validation

### 4. Success Message Update (`components/event-detail-client.tsx`)

- Updated success message to mention email confirmation
- Sets clear expectation: "Expect to hear from us within 7 days"

### 5. Enhanced Testing Endpoint (`app/api/test-email/route.ts`)

- Extended existing test endpoint to support both email types
- Can test welcome, audition confirmation, and audition notification emails
- Usage:
  - `GET /api/test-email?type=audition-confirmation` (for submitters)
  - `GET /api/test-email?type=audition-notification` (for event owners)

## Email Content

### For Audition Tape Submitters (Confirmation)

- ✅ Visual confirmation that submission was received
- 📋 Event details (title, role, date, location, submitter name)
- 🕐 Clear timeline: "Expect to hear from us within 7 days"
- 📝 Important notes about the review process
- 🎭 Encouraging message: "Break a leg!"

### For Event Owners (Notification)

- 🎬 Alert about new audition tape submission
- 👤 Complete submitter information (name, email if provided)
- 🎥 Direct link to the audition video
- 📝 Any additional notes from the submitter
- 📋 Full event and role details
- 🎯 Clear next steps and action items
- ⏰ Reminder about stated response timeline

## Technical Details

### Dependencies

- Uses existing Mailgun integration
- Requires `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and `MAILGUN_FROM_EMAIL` environment variables
- Firebase integration for fetching user data

### Error Handling

- Email sending errors are logged but don't prevent tape submission
- Graceful degradation if email service is unavailable
- Safe user data fetching with null checks

### Email Tracking

- Both email types are tagged for analytics:
  - Submitter emails: `audition-confirmation`, `audition-tape`
  - Owner emails: `audition-notification`, `event-owner`
- Includes tracking for opens and clicks

## User Experience Flow

### 1. Actor Submits Audition Tape

1. Fills out form with required email address
2. Submits tape successfully
3. **Immediately receives** confirmation email
4. Knows to expect feedback within 7 days

### 2. Event Owner Gets Notified

1. **Immediately receives** notification email about new submission
2. Can click directly to watch the audition video
3. Has all submitter contact information
4. Gets clear next steps for the casting process
5. Reminded about their stated response timeline

## Testing

### Manual Testing

1. Submit an audition tape with a valid email address
2. Check that confirmation email is received by submitter
3. Check that notification email is received by event owner
4. Verify both emails are properly formatted with all details

### API Testing

```bash
# Test submitter confirmation email
curl "http://localhost:3000/api/test-email?type=audition-confirmation"

# Test event owner notification email
curl "http://localhost:3000/api/test-email?type=audition-notification"

# Test welcome email (existing)
curl "http://localhost:3000/api/test-email?type=welcome"
```

## User Experience Improvements

### For Actors/Submitters:

1. **Immediate Feedback**: Instant confirmation their submission worked
2. **Clear Expectations**: 7-day timeline prevents anxious waiting
3. **Professional Communication**: Builds trust with polished, branded emails
4. **Reference Information**: All submission details for their records

### For Event Owners/Casting Directors:

1. **Instant Alerts**: Know immediately when new tapes arrive
2. **Complete Information**: All submitter and submission details in one place
3. **Quick Access**: Direct links to audition videos
4. **Professional Management**: Helps maintain organized casting process
5. **Contact Information**: Easy access to reach promising candidates

## Future Enhancements

Potential improvements could include:

- Follow-up emails if no response after 7 days
- Status update emails when tapes are reviewed
- Bulk email tools for casting directors
- Integration with calendar for callback scheduling
- Email preferences management
- Automated reminders for event owners to review tapes
- Analytics dashboard for email engagement

## Environment Variables Required

Ensure these are set for email functionality:

```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=your_from_email_address
NEXT_PUBLIC_BASE_URL=your_app_base_url
```

## Database Requirements

The system fetches user data from:

- `artifacts/{appId}/public/data/users/{userId}` - For event owner details
- Requires users to have `email` field populated for notifications to work
