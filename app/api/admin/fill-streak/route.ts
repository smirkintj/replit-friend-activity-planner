import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subDays, format, startOfDay } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const { friendName, days } = await request.json();
    
    if (!friendName || !days) {
      return NextResponse.json(
        { error: 'friendName and days are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Find the friend
    const { data: friend, error: friendError } = await supabase
      .from('friends')
      .select('id, name')
      .ilike('name', `%${friendName}%`)
      .single();

    if (friendError || !friend) {
      return NextResponse.json(
        { error: 'Friend not found' },
        { status: 404 }
      );
    }

    // 2. Get existing activities from the past N days
    const startDate = format(subDays(startOfDay(new Date()), days - 1), 'yyyy-MM-dd');
    const { data: existingActivities, error: activitiesError } = await supabase
      .from('fitness_activities')
      .select('date')
      .eq('friend_id', friend.id)
      .gte('date', startDate);

    if (activitiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch existing activities' },
        { status: 500 }
      );
    }

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

    // 5. Insert minimal dummy workouts for missing days
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

    if (dummyActivities.length > 0) {
      const { error: insertError } = await supabase
        .from('fitness_activities')
        .insert(dummyActivities);

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to insert dummy activities', details: insertError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      friendName: friend.name,
      friendId: friend.id,
      daysRequested: days,
      existingWorkouts: existingActivities?.length || 0,
      missingDays: missingDays.length,
      fillersAdded: dummyActivities.length,
      filledDates: missingDays
    });

  } catch (error) {
    console.error('Error filling streak:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
