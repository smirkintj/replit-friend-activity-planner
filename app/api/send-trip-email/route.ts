import { NextResponse } from 'next/server';
import { sendTripCreatedEmail, sendTripUpdatedEmail, sendTripCancelledEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, toEmail, toName, trip, changes } = body;

    if (!toEmail || !toName || !trip) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'created':
        await sendTripCreatedEmail(toEmail, toName, trip);
        break;
      case 'updated':
        await sendTripUpdatedEmail(toEmail, toName, trip, changes || {});
        break;
      case 'cancelled':
        await sendTripCancelledEmail(toEmail, toName, trip);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error sending trip email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
