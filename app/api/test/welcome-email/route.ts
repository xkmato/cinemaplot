import { sendWelcomeEmail } from '@/lib/email-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Only allow this in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, firstName, displayName, username } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const success = await sendWelcomeEmail({
      email,
      firstName: firstName || 'Test',
      displayName: displayName || 'Test User',
      username: username || undefined,
    });

    return NextResponse.json(
      { 
        success,
        message: success ? 'Test welcome email sent successfully' : 'Failed to send test email',
        testData: { email, firstName, displayName, username }
      },
      { status: success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in test welcome email API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
