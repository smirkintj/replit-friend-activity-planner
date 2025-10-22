import { NextRequest, NextResponse } from 'next/server';
import { syncStravaActivity } from '@/lib/strava-sync';

const VERIFY_TOKEN = 'FITSQUAD_WEBHOOK_2025';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return NextResponse.json({ 'hub.challenge': challenge });
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    console.log('Strava webhook event received:', event);

    if (event.object_type === 'activity' && event.aspect_type === 'create') {
      await syncStravaActivity(event.owner_id, event.object_id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
