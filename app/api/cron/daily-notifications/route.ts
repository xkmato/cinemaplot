import { sendDailyNotificationDigests } from '@/lib/notification-email-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/API key check for security
    const authHeader = request.headers.get('authorization');
    const expectedApiKey = process.env.CRON_API_KEY;
    
    if (expectedApiKey && authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Daily notification digest cron job triggered at:', new Date().toISOString());
    
    const result = await sendDailyNotificationDigests();
    
    return NextResponse.json({
      success: true,
      message: 'Daily notification digests processed',
      result: {
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in daily notification digest cron:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET requests for testing purposes
  return POST(request);
}
