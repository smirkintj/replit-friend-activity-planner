#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { subDays, format, startOfDay } from 'date-fns';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fillStreak(friendName: string, days: number) {
  console.log(`[FillStreak] Starting for ${friendName}, ${days} days`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Find the friend
  console.log('[FillStreak] Querying for friend...');
  const { data: friends, error: friendError } = await supabase
    .from('friends')
    .select('id, name');

  if (friendError) {
    console.error('[FillStreak] Error fetching friends:', friendError);
    process.exit(1);
  }

  const friend = friends?.find(f => 
    f.name.toLowerCase().includes(friendName.toLowerCase())
  );

  if (!friend) {
    console.error('[FillStreak] Friend not found');
    console.log('Available friends:', friends?.map(f => f.name).join(', '));
    process.exit(1);
  }

  console.log(`[FillStreak] Found friend: ${friend.name} (${friend.id})`);

  // 2. Get existing activities from the past N days
  const startDate = format(subDays(startOfDay(new Date()), days - 1), 'yyyy-MM-dd');
  console.log(`[FillStreak] Fetching activities since ${startDate}...`);
  
  const { data: existingActivities, error: activitiesError } = await supabase
    .from('fitness_activities')
    .select('date')
    .eq('friend_id', friend.id)
    .gte('date', startDate);

  if (activitiesError) {
    console.error('[FillStreak] Error fetching activities:', activitiesError);
    process.exit(1);
  }

  console.log(`[FillStreak] Found ${existingActivities?.length || 0} existing activities`);

  // 3. Create a set of existing dates
  const existingDates = new Set(
    (existingActivities || []).map((a: any) => a.date)
  );

  // 4. Identify missing days
  const missingDays: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = format(subDays(startOfDay(new Date()), i), 'yyyy-MM-dd');
    if (!existingDates.has(date)) {
      missingDays.push(date);
    }
  }

  console.log(`[FillStreak] Found ${missingDays.length} missing days`);
  if (missingDays.length === 0) {
    console.log('[FillStreak] No missing days! Streak is already complete.');
    return;
  }

  // 5. Insert minimal dummy workouts for missing days
  console.log('[FillStreak] Creating filler workouts...');
  const dummyActivities = missingDays.map(date => ({
    friend_id: friend.id,
    type: 'walk',
    date: date,
    duration: 10,
    distance: 0.5,
    calories: 25,
    points: 5,
    source: 'manual',
    notes: 'Streak filler'
  }));

  const { error: insertError } = await supabase
    .from('fitness_activities')
    .insert(dummyActivities);

  if (insertError) {
    console.error('[FillStreak] Error inserting activities:', insertError);
    process.exit(1);
  }

  console.log(`[FillStreak] ✅ Successfully added ${dummyActivities.length} filler workouts!`);
  console.log(`[FillStreak] Streak should now be ${days} days`);
  console.log('[FillStreak] Filled dates:', missingDays.slice(0, 5).join(', '), missingDays.length > 5 ? `... (${missingDays.length - 5} more)` : '');
}

// Run the script
const friendName = process.argv[2] || 'Putra';
const days = parseInt(process.argv[3] || '30');

fillStreak(friendName, days).catch(console.error);
