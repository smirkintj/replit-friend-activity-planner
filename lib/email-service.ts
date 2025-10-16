import { getUncachableResendClient } from './resend-client';
import { format } from 'date-fns';

interface TripDetails {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  participants: string[];
  notes?: string;
}

// Generate iCalendar (.ics) file content
function generateICS(trip: TripDetails): string {
  const formatDateForICS = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDateTime = formatDateForICS(trip.startDate);
  const endDateTime = formatDateForICS(trip.endDate);
  
  const description = [
    trip.notes ? `Notes: ${trip.notes}` : '',
    `Organized by: ${trip.organizer}`,
    `With: ${trip.participants.join(', ')}`
  ].filter(Boolean).join('\\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Friend Activity Planner//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${trip.title}
DESCRIPTION:${description}
LOCATION:${trip.location || ''}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT24H
DESCRIPTION:Reminder: ${trip.title}
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export async function sendTripCreatedEmail(
  toEmail: string,
  toName: string,
  trip: TripDetails
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const icsContent = generateICS(trip);
    const formattedStartDate = format(new Date(trip.startDate), 'EEEE, MMMM d, yyyy');
    const formattedEndDate = format(new Date(trip.endDate), 'EEEE, MMMM d, yyyy');

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Trip: ${trip.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">🎉 You've been added to a trip!</h2>
          
          <div style="background: #f8f9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${trip.title}</h3>
            <p style="margin: 10px 0;"><strong>📅 Dates:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
            ${trip.location ? `<p style="margin: 10px 0;"><strong>📍 Location:</strong> ${trip.location}</p>` : ''}
            <p style="margin: 10px 0;"><strong>👤 Organized by:</strong> ${trip.organizer}</p>
            <p style="margin: 10px 0;"><strong>👥 With:</strong> ${trip.participants.join(', ')}</p>
            ${trip.notes ? `<p style="margin: 10px 0;"><strong>📝 Notes:</strong> ${trip.notes}</p>` : ''}
          </div>
          
          <p style="color: #666;">The calendar invite is attached to this email. You can add it to your Google Calendar or Apple Calendar!</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from Friend Activity Planner
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'trip-invite.ics',
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    });

    console.log(`[Email] Trip created notification sent to ${toEmail}`);
  } catch (error) {
    console.error(`[Email] Failed to send trip created email to ${toEmail}:`, error);
    throw error;
  }
}

export async function sendTripUpdatedEmail(
  toEmail: string,
  toName: string,
  trip: TripDetails,
  changes: { oldStartDate?: string; oldEndDate?: string }
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const icsContent = generateICS(trip);
    const formattedStartDate = format(new Date(trip.startDate), 'EEEE, MMMM d, yyyy');
    const formattedEndDate = format(new Date(trip.endDate), 'EEEE, MMMM d, yyyy');

    let changeText = '';
    if (changes.oldStartDate && changes.oldStartDate !== trip.startDate) {
      const oldStart = format(new Date(changes.oldStartDate), 'EEEE, MMMM d, yyyy');
      changeText += `<p style="color: #f59e0b;">📅 Start date changed from ${oldStart} to ${formattedStartDate}</p>`;
    }
    if (changes.oldEndDate && changes.oldEndDate !== trip.endDate) {
      const oldEnd = format(new Date(changes.oldEndDate), 'EEEE, MMMM d, yyyy');
      changeText += `<p style="color: #f59e0b;">📅 End date changed from ${oldEnd} to ${formattedEndDate}</p>`;
    }

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Trip Updated: ${trip.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">📝 Trip dates have been updated!</h2>
          
          <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            ${changeText}
          </div>
          
          <div style="background: #f8f9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${trip.title}</h3>
            <p style="margin: 10px 0;"><strong>📅 New Dates:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
            ${trip.location ? `<p style="margin: 10px 0;"><strong>📍 Location:</strong> ${trip.location}</p>` : ''}
            <p style="margin: 10px 0;"><strong>👤 Organized by:</strong> ${trip.organizer}</p>
            <p style="margin: 10px 0;"><strong>👥 With:</strong> ${trip.participants.join(', ')}</p>
          </div>
          
          <p style="color: #666;">An updated calendar invite is attached. Please update your calendar!</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from Friend Activity Planner
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'trip-invite-updated.ics',
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    });

    console.log(`[Email] Trip updated notification sent to ${toEmail}`);
  } catch (error) {
    console.error(`[Email] Failed to send trip updated email to ${toEmail}:`, error);
    throw error;
  }
}

export async function sendTripCancelledEmail(
  toEmail: string,
  toName: string,
  trip: TripDetails
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const formattedStartDate = format(new Date(trip.startDate), 'EEEE, MMMM d, yyyy');
    const formattedEndDate = format(new Date(trip.endDate), 'EEEE, MMMM d, yyyy');

    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Trip Cancelled: ${trip.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">❌ Trip Cancelled</h2>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="margin-top: 0; color: #333;">${trip.title}</h3>
            <p style="margin: 10px 0;">This trip has been cancelled by ${trip.organizer}.</p>
            <p style="margin: 10px 0;"><strong>📅 Was scheduled for:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
            ${trip.location ? `<p style="margin: 10px 0;"><strong>📍 Location:</strong> ${trip.location}</p>` : ''}
          </div>
          
          <p style="color: #666;">Please remove this event from your calendar.</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from Friend Activity Planner
          </p>
        </div>
      `,
    });

    console.log(`[Email] Trip cancelled notification sent to ${toEmail}`);
  } catch (error) {
    console.error(`[Email] Failed to send trip cancelled email to ${toEmail}:`, error);
    throw error;
  }
}
