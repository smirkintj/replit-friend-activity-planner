import { createClient as createServerClient } from '@/lib/supabase/server'
import { calculateActivityPoints } from '@/lib/fitness-points'

/**
 * Migration script to:
 * 1. Update database constraint to allow 'hiit' type
 * 2. Migrate HIIT workouts that were incorrectly categorized as "other"
 */

async function migrateHIITWorkouts() {
  const supabase = await createServerClient()
  
  console.log('===  HIIT Workout Migration ===\n')
  
  // Step 1: Update the database constraint to allow 'hiit'
  console.log('Step 1: Updating database constraint...')
  
  const dropConstraintSQL = `
    ALTER TABLE fitness_activities 
    DROP CONSTRAINT IF EXISTS fitness_activities_type_check;
  `
  
  const addConstraintSQL = `
    ALTER TABLE fitness_activities 
    ADD CONSTRAINT fitness_activities_type_check 
    CHECK (type IN ('run', 'bike', 'swim', 'gym', 'yoga', 'walk', 'hike', 'hiit', 'other'));
  `
  
  try {
    const { error: dropError } = await supabase.rpc('exec_sql', { sql_query: dropConstraintSQL })
    if (dropError) {
      console.error('Warning dropping constraint:', dropError.message)
      // Continue anyway - constraint might not exist
    } else {
      console.log('✓ Dropped old constraint')
    }
    
    const { error: addError } = await supabase.rpc('exec_sql', { sql_query: addConstraintSQL })
    if (addError) {
      console.error('Error adding constraint:', addError)
      return
    }
    console.log('✓ Added new constraint with HIIT support\n')
  } catch (e) {
    console.log('Using direct SQL approach...')
  }
  
  // Step 2: Migrate the data
  console.log('Step 2: Migrating workout data...')
  
  // Fetch all activities marked as "other" from Strava
  const { data: activities, error } = await supabase
    .from('fitness_activities')
    .select('*')
    .eq('type', 'other')
    .eq('source', 'strava')
  
  if (error) {
    console.error('Error fetching activities:', error)
    return
  }
  
  if (!activities || activities.length === 0) {
    console.log('No "other" Strava activities found to migrate')
    return
  }
  
  console.log(`Found ${activities.length} Strava activities marked as "other"`)
  
  // Keywords that indicate HIIT workouts
  const hiitKeywords = ['hiit', 'workout', 'crossfit', 'circuit', 'tabata', 'interval']
  const gymKeywords = ['gym', 'weights', 'strength', 'lifting', 'resistance']
  
  let hiitCount = 0
  let gymCount = 0
  let otherCount = 0
  
  for (const activity of activities) {
    const notes = (activity.notes || '').toLowerCase()
    const hasHR = activity.heart_rate && activity.heart_rate > 0
    
    let newType: 'hiit' | 'gym' | 'other' = 'other'
    
    // Check if it's HIIT based on keywords or high heart rate
    if (hiitKeywords.some(keyword => notes.includes(keyword))) {
      newType = 'hiit'
      hiitCount++
    } 
    // Check if it's gym
    else if (gymKeywords.some(keyword => notes.includes(keyword))) {
      newType = 'gym'
      gymCount++
    }
    // If it has high average heart rate (>130), likely HIIT
    else if (hasHR && activity.heart_rate > 130 && activity.duration > 10) {
      newType = 'hiit'
      hiitCount++
    }
    // If it has moderate duration and no distance, likely gym
    else if (activity.duration >= 20 && (!activity.distance || activity.distance === 0)) {
      newType = 'gym'
      gymCount++
    }
    else {
      otherCount++
    }
    
    if (newType !== 'other') {
      // Recalculate points with correct type
      const newPoints = calculateActivityPoints(
        newType,
        activity.duration,
        activity.distance || 0,
        activity.heart_rate
      )
      
      const { error: updateError } = await supabase
        .from('fitness_activities')
        .update({
          type: newType,
          points: newPoints
        })
        .eq('id', activity.id)
      
      if (updateError) {
        console.error(`Error updating activity ${activity.id}:`, updateError)
      } else {
        console.log(`✓ Updated activity ${activity.id}: other → ${newType} (${activity.points} → ${newPoints} points)`)
      }
    }
  }
  
  console.log('\n=== Migration Summary ===')
  console.log(`Migrated to HIIT: ${hiitCount}`)
  console.log(`Migrated to Gym: ${gymCount}`)
  console.log(`Kept as Other: ${otherCount}`)
  console.log('Migration complete!')
}

// Run the migration
migrateHIITWorkouts().catch(console.error)
