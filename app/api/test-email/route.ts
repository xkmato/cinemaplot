import { AuditionTapeConfirmationData, AuditionTapeNotificationData, sendAuditionTapeConfirmationEmail, sendAuditionTapeNotificationEmail, sendWelcomeEmail, WelcomeEmailData } from '@/lib/email-service';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type') || 'welcome';
    
    console.log(`Testing ${emailType} email configuration...`);
    
    // Check environment variables
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL;
    
    console.log('Environment variables check:');
    console.log('MAILGUN_API_KEY:', apiKey ? 'Set' : 'Missing');
    console.log('MAILGUN_DOMAIN:', domain || 'Missing');
    console.log('MAILGUN_FROM_EMAIL:', fromEmail || 'Missing');
    
    if (!apiKey || !domain) {
      return NextResponse.json({
        error: 'Missing required environment variables',
        missing: {
          apiKey: !apiKey,
          domain: !domain,
        }
      }, { status: 500 });
    }
    
    let success = false;
    let emailData: WelcomeEmailData | AuditionTapeConfirmationData | AuditionTapeNotificationData | null = null;
    
    if (emailType === 'welcome') {
      // Test welcome email data
      const testEmailData: WelcomeEmailData = {
        email: 'kenneth@uvotam.com', // Replace with your email for testing
        firstName: 'Kenneth',
        displayName: 'Kenneth Test',
        username: 'kennethtest'
      };
      
      console.log('Attempting to send test welcome email...');
      success = await sendWelcomeEmail(testEmailData);
      emailData = testEmailData;
    } else if (emailType === 'audition-confirmation') {
      // Test audition tape confirmation email data
      const testEmailData: AuditionTapeConfirmationData = {
        submitterName: 'Kenneth Test Actor',
        email: 'kenneth@uvotam.com', // Replace with your email for testing
        eventTitle: 'Feature Film Audition - Leading Role',
        roleName: 'Jake Morrison',
        eventDate: 'Saturday, December 21, 2024',
        eventLocation: 'Los Angeles, CA - Studio District'
      };
      
      console.log('Attempting to send test audition confirmation email...');
      success = await sendAuditionTapeConfirmationEmail(testEmailData);
      emailData = testEmailData;
    } else if (emailType === 'audition-notification') {
      // Test audition tape notification email data (for event owners)
      const testEmailData: AuditionTapeNotificationData = {
        eventOwnerName: 'Kenneth Director',
        email: 'kenneth@uvotam.com', // Replace with your email for testing
        eventTitle: 'Feature Film Audition - Leading Role',
        roleName: 'Jake Morrison',
        eventDate: 'Saturday, December 21, 2024',
        eventLocation: 'Los Angeles, CA - Studio District',
        submitterName: 'Jane Smith Actor',
        submitterEmail: 'jane@example.com',
        tapeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: 'I\'m really excited about this role and have prepared thoroughly. Looking forward to hearing from you!'
      };
      
      console.log('Attempting to send test audition notification email...');
      success = await sendAuditionTapeNotificationEmail(testEmailData);
      emailData = testEmailData;
    } else {
      return NextResponse.json({
        error: 'Invalid email type',
        supportedTypes: ['welcome', 'audition-confirmation', 'audition-notification']
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success,
      emailType,
      message: success ? `Test ${emailType} email sent successfully` : `Failed to send test ${emailType} email`,
      emailData,
      configuration: {
        domain,
        fromEmail: fromEmail || `noreply@${domain}`,
      }
    });
    
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
