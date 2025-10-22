import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = 'FITSQUAD_WEBHOOK_2025';

export async function POST(request: NextRequest) {
  try {
    const callbackUrl = `https://korangfreebila.replit.app/api/strava/webhook`;
    
    console.log('[Webhook Register] Registering webhook with Strava...');
    console.log('[Webhook Register] Callback URL:', callbackUrl);

    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        callback_url: callbackUrl,
        verify_token: VERIFY_TOKEN,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && data.errors[0]?.code === 'already exists') {
        console.log('[Webhook Register] Webhook already registered');
        return NextResponse.json({
          success: true,
          message: 'Webhook already registered',
          alreadyExists: true,
        });
      }

      console.error('[Webhook Register] Failed to register webhook:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Failed to register webhook',
        },
        { status: response.status }
      );
    }

    console.log('[Webhook Register] Successfully registered webhook:', data);

    return NextResponse.json({
      success: true,
      message: 'Webhook registered successfully',
      subscription: data,
    });
  } catch (error) {
    console.error('[Webhook Register] Error registering webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register webhook',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('[Webhook Register] Checking existing webhook subscriptions...');

    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Webhook Register] Failed to fetch subscriptions:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch webhook subscriptions',
        },
        { status: response.status }
      );
    }

    const subscriptions = await response.json();
    console.log('[Webhook Register] Existing subscriptions:', subscriptions);

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error('[Webhook Register] Error fetching subscriptions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions',
      },
      { status: 500 }
    );
  }
}
