import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateActivityPoints } from '@/lib/fitness-points'

export async function POST() {
  try {
    const supabase = await createClient()
    
    console.log('Starting HIIT migration...')
    
    // Instructions for manual SQL execution
    const sqlInstructions = `
      -- Run this SQL in your Supabase SQL Editor:
      
      -- Step 1: Drop old constraint
      ALTER TABLE fitness_activities 
      DROP CONSTRAINT IF EXISTS fitness_activities_type_check;
      
      -- Step 2: Add new constraint with HIIT
      ALTER TABLE fitness_activities 
      ADD CONSTRAINT fitness_activities_type_check 
      CHECK (type IN ('run', 'bike', 'swim', 'gym', 'yoga', 'walk', 'hike', 'hiit', 'other'));
    `
    
    console.log(sqlInstructions)
    
    // Now migrate the data
    const { data: activities, error } = await supabase
      .from('fitness_activities')
      .select('*')
      .eq('type', 'other')
      .eq('source', 'strava')
    
    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json({ error: 'Failed to fetch activities', details: error }, { status: 500 })
    }
    
    if (!activities || activities.length === 0) {
      return NextResponse.json({ success: true, message: 'No activities to migrate', sqlInstructions })
    }
    
    console.log(`Found ${activities.length} Strava activities marked as "other"`)
    
    const hiitKeywords = ['hiit', 'workout', 'crossfit', 'circuit', 'tabata', 'interval']
    const gymKeywords = ['gym', 'weights', 'strength', 'lifting', 'resistance']
    
    let hiitCount = 0
    let gymCount = 0
    const updates = []
    
    for (const activity of activities) {
      const notes = (activity.notes || '').toLowerCase()
      const hasHR = activity.heart_rate && activity.heart_rate > 0
      
      let newType: 'hiit' | 'gym' | null = null
      
      if (hiitKeywords.some(keyword => notes.includes(keyword))) {
        newType = 'hiit'
        hiitCount++
      } else if (gymKeywords.some(keyword => notes.includes(keyword))) {
        newType = 'gym'
        gymCount++
      } else if (hasHR && activity.heart_rate > 130 && activity.duration > 10) {
        newType = 'hiit'
        hiitCount++
      } else if (activity.duration >= 20 && (!activity.distance || activity.distance === 0)) {
        newType = 'gym'
        gymCount++
      }
      
      if (newType) {
        const newPoints = calculateActivityPoints(
          newType,
          activity.duration,
          activity.distance || 0,
          activity.heart_rate
        )
        
        updates.push({ id: activity.id, type: newType, points: newPoints })
      }
    }
    
    // Try to update (will fail if constraint not updated yet)
    const results = []
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('fitness_activities')
        .update({ type: update.type, points: update.points })
        .eq('id', update.id)
      
      if (updateError) {
        results.push({ id: update.id, error: updateError.message })
      } else {
        results.push({ id: update.id, success: true })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      summary: {
        total: activities.length,
        hiit: hiitCount,
        gym: gymCount,
        results
      },
      sqlInstructions
    })
  } catch (error) {
    console.error('Error in migration:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
