import { sendWelcomeEmail, WelcomeEmailData } from '@/lib/email-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, displayName, username } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const emailData: WelcomeEmailData = {
      email,
      firstName,
      displayName,
      username,
    };

    const success = await sendWelcomeEmail(emailData);

    if (success) {
      return NextResponse.json(
        { message: 'Welcome email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in welcome email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
