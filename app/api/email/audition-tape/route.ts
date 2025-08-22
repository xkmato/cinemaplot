import { AuditionTapeConfirmationData, AuditionTapeNotificationData, getUserById, sendAuditionTapeConfirmationEmail, sendAuditionTapeNotificationEmail } from '@/lib/email-service';
import { NextRequest, NextResponse } from 'next/server';

interface ConfirmationEmailRequest {
  submitterName: string;
  email: string;
  eventTitle: string;
  roleName: string;
  eventDate: string;
  eventLocation: string;
}

interface NotificationEmailRequest {
  eventOwnerId: string;
  eventTitle: string;
  roleName: string;
  eventDate: string;
  eventLocation: string;
  submitterName: string;
  submitterEmail?: string;
  tapeUrl: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('Audition tape email API called with type:', type);

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'confirmation':
        return await handleConfirmationEmail(data);
      case 'notification':
        return await handleNotificationEmail(data);
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be "confirmation" or "notification"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in audition tape email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleConfirmationEmail(data: ConfirmationEmailRequest) {
  try {
    // Validate required fields for confirmation email
    const { submitterName, email, eventTitle, roleName, eventDate, eventLocation } = data;

    if (!submitterName || !email || !eventTitle || !roleName || !eventDate || !eventLocation) {
      return NextResponse.json(
        { error: 'Missing required fields for confirmation email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailData: AuditionTapeConfirmationData = {
      submitterName,
      email,
      eventTitle,
      roleName,
      eventDate,
      eventLocation,
    };

    console.log('Sending audition tape confirmation email to:', email);
    const success = await sendAuditionTapeConfirmationEmail(emailData);

    if (success) {
      console.log('Audition tape confirmation email sent successfully for:', email);
      return NextResponse.json(
        { message: 'Audition tape confirmation email sent successfully' },
        { status: 200 }
      );
    } else {
      console.log('sendAuditionTapeConfirmationEmail returned false for:', email);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

async function handleNotificationEmail(data: NotificationEmailRequest) {
  try {
    // Validate required fields for notification email
    const { eventOwnerId, eventTitle, roleName, eventDate, eventLocation, submitterName, submitterEmail, tapeUrl, notes } = data;

    if (!eventOwnerId || !eventTitle || !roleName || !eventDate || !eventLocation || !submitterName || !tapeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields for notification email' },
        { status: 400 }
      );
    }

    // Get event owner details
    const eventOwner = await getUserById(eventOwnerId);
    if (!eventOwner || !eventOwner.email) {
      console.log('Event owner not found or has no email:', eventOwnerId);
      return NextResponse.json(
        { message: 'Event owner email not available - notification not sent' },
        { status: 200 }
      );
    }

    const eventOwnerName = eventOwner.firstName || eventOwner.displayName || eventOwner.username || 'Event Creator';

    const emailData: AuditionTapeNotificationData = {
      eventOwnerName,
      email: eventOwner.email,
      eventTitle,
      roleName,
      eventDate,
      eventLocation,
      submitterName,
      submitterEmail,
      tapeUrl,
      notes,
    };

    console.log('Sending audition tape notification email to event owner:', eventOwner.email);
    const success = await sendAuditionTapeNotificationEmail(emailData);

    if (success) {
      console.log('Audition tape notification email sent successfully to:', eventOwner.email);
      return NextResponse.json(
        { message: 'Audition tape notification email sent successfully' },
        { status: 200 }
      );
    } else {
      console.log('sendAuditionTapeNotificationEmail returned false for:', eventOwner.email);
      return NextResponse.json(
        { error: 'Failed to send notification email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
    return NextResponse.json(
      { error: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}
