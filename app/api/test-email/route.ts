import { sendWelcomeEmail, WelcomeEmailData } from '@/lib/email-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing email configuration...');
    
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
    
    // Test email data
    const testEmailData: WelcomeEmailData = {
      email: 'kenneth@uvotam.com', // Replace with your email for testing
      firstName: 'Kenneth',
      displayName: 'Kenneth Test',
      username: 'kennethtest'
    };
    
    console.log('Attempting to send test email...');
    const success = await sendWelcomeEmail(testEmailData);
    
    return NextResponse.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
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
