import { createClient as createServerClient } from './supabase/server';
import { linkWorkoutToEvent } from './fitness-events-storage';
import type { FitnessActivity, FitnessEvent } from './types';

const EVENT_CATEGORY_MAP: Record<FitnessActivity['type'], string[]> = {
  run: ['run', 'race'],
  bike: ['ride'],
  hike: ['hike'],
  swim: ['swim'],
  gym: ['other'],
  yoga: ['other'],
  walk: ['other'],
  hiit: ['other'],
  other: ['other'],
};

const BASE_GROUP_BONUS_POINTS = 50;

export async function checkAndLinkEventWorkout(
  friendId: string,
  fitnessActivityId: string,
  workoutType: FitnessActivity['type'],
  workoutDate: string
): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    // Find fitness events where:
    // 1. Friend is checked in (attendance_status = 'checked_in')
    // 2. Event date matches workout date
    // 3. Event category matches workout type
    // 4. No workout linked yet (fitness_activity_id IS NULL)
    // 5. Auto-logging is enabled (auto_log_workouts = true)
    
    const matchingCategories = EVENT_CATEGORY_MAP[workoutType] || ['other'];
    
    const { data: participants, error } = await supabase
      .from('fitness_event_participants')
      .select(`
        id,
        event_id,
        fitness_events!inner (
          id,
          event_category,
          points_override,
          auto_log_workouts,
          activities!inner (
            start_date
          )
        )
      `)
      .eq('friend_id', friendId)
      .eq('attendance_status', 'checked_in')
      .is('fitness_activity_id', null);
    
    if (error || !participants || participants.length === 0) {
      console.log('[EventAutoLink] No eligible events found for auto-linking');
      return false;
    }
    
    // Filter by date, category match, and auto_log_workouts enabled
    const matchingEvent = participants.find((p: any) => {
      const event = p.fitness_events;
      const eventDate = event.activities.start_date;
      const eventCategory = event.event_category;
      const autoLogEnabled = event.auto_log_workouts;
      
      return eventDate === workoutDate && 
             matchingCategories.includes(eventCategory) &&
             autoLogEnabled === true;
    });
    
    if (!matchingEvent) {
      console.log('[EventAutoLink] No matching event found for workout (date/category/auto-log check failed)');
      return false;
    }
    
    // Calculate bonus points
    const event: any = matchingEvent.fitness_events;
    const bonusPoints = event.points_override || BASE_GROUP_BONUS_POINTS;
    
    // Atomically link the workout to the event (only if not already linked)
    const { error: updateError } = await supabase
      .from('fitness_event_participants')
      .update({
        fitness_activity_id: fitnessActivityId,
        bonus_points_awarded: bonusPoints,
      })
      .eq('id', matchingEvent.id)
      .eq('friend_id', friendId)
      .is('fitness_activity_id', null); // Only update if not already linked (prevents race)
    
    if (updateError) {
      console.error('[EventAutoLink] Error linking workout:', updateError);
      return false;
    }
    
    console.log(`[EventAutoLink] Successfully linked workout ${fitnessActivityId} to event ${matchingEvent.event_id} with +${bonusPoints} bonus points`);
    
    // Award bonus points to the fitness activity
    await awardBonusPoints(fitnessActivityId, bonusPoints);
    
    return true;
  } catch (error) {
    console.error('[EventAutoLink] Error checking and linking event workout:', error);
    return false;
  }
}

async function awardBonusPoints(fitnessActivityId: string, bonusPoints: number): Promise<void> {
  try {
    const supabase = await createServerClient();
    
    // Get current points
    const { data: activity } = await supabase
      .from('fitness_activities')
      .select('points')
      .eq('id', fitnessActivityId)
      .single();
    
    if (!activity) {
      console.error('[EventAutoLink] Activity not found for bonus points');
      return;
    }
    
    const newTotalPoints = activity.points + bonusPoints;
    
    // Update points with bonus
    await supabase
      .from('fitness_activities')
      .update({ points: newTotalPoints })
      .eq('id', fitnessActivityId);
    
    console.log(`[EventAutoLink] Awarded +${bonusPoints} bonus points (total: ${newTotalPoints})`);
  } catch (error) {
    console.error('[EventAutoLink] Error awarding bonus points:', error);
  }
}
