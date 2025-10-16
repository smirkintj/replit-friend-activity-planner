// Helper functions for sending trip notification emails
import type { Friend, Activity } from './types';

interface EmailTripDetails {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  participants: string[];
  notes?: string;
}

export async function sendTripNotifications(
  type: 'created' | 'updated' | 'cancelled',
  activity: Activity,
  friends: Friend[],
  changes?: { oldStartDate?: string; oldEndDate?: string }
) {
  // Get organizer and participant details
  const organizer = friends.find(f => f.id === activity.organizerId);
  const participantFriends = friends.filter(f => 
    activity.friendIds?.includes(f.id) && f.id !== activity.organizerId
  );

  if (!organizer) {
    console.log('[Email] No organizer found, skipping notifications');
    return;
  }

  const tripDetails: EmailTripDetails = {
    title: activity.title,
    startDate: activity.startDate,
    endDate: activity.endDate,
    location: activity.location,
    organizer: organizer.name,
    participants: participantFriends.map(f => f.name),
    notes: activity.notes,
  };

  // Send email to each participant (excluding organizer)
  const emailPromises = participantFriends
    .filter(friend => friend.email) // Only send to friends with email
    .map(async (friend) => {
      try {
        const response = await fetch('/api/send-trip-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            toEmail: friend.email,
            toName: friend.name,
            trip: tripDetails,
            changes: changes || {},
          }),
        });

        if (!response.ok) {
          console.error(`[Email] Failed to send ${type} email to ${friend.name}`);
        } else {
          console.log(`[Email] Sent ${type} notification to ${friend.name}`);
        }
      } catch (error) {
        console.error(`[Email] Error sending ${type} email to ${friend.name}:`, error);
      }
    });

  await Promise.allSettled(emailPromises);
}
