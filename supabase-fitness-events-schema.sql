-- Fitness Events Database Schema
-- Run this SQL in your Supabase SQL Editor to add fitness event support

-- 1. Extend activities table type enum to include 'fitness_event'
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check 
  CHECK (type IN ('trip', 'activity', 'fitness_event'));

-- 2. Add is_fitness_event helper column to activities with constraint
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_fitness_event BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Add CHECK constraint to ensure is_fitness_event matches type
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_fitness_event_consistency;
ALTER TABLE activities ADD CONSTRAINT activities_fitness_event_consistency 
  CHECK ((type = 'fitness_event' AND is_fitness_event = TRUE) OR (type != 'fitness_event' AND is_fitness_event = FALSE));

-- 4. Create fitness_events detail table
CREATE TABLE IF NOT EXISTS fitness_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL UNIQUE REFERENCES activities(id) ON DELETE CASCADE,
  event_category VARCHAR NOT NULL CHECK (event_category IN ('run', 'ride', 'hike', 'race', 'swim', 'other')),
  intensity_level VARCHAR CHECK (intensity_level IN ('easy', 'moderate', 'hard', 'race')),
  meetup_location TEXT,
  meetup_lat DECIMAL(10, 8),
  meetup_lng DECIMAL(11, 8),
  meetup_notes TEXT,
  route_source VARCHAR CHECK (route_source IN ('strava', 'gpx', 'manual', 'none')),
  route_external_id VARCHAR, -- Strava route ID or GPX file path
  route_snapshot JSONB, -- Store route details/preview data
  gear_checklist JSONB, -- Array of gear items needed
  logistics_notes TEXT,
  auto_log_workouts BOOLEAN DEFAULT TRUE,
  points_override INTEGER, -- Optional: override default points for this event
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_events_activity_id ON fitness_events(activity_id);
CREATE INDEX IF NOT EXISTS idx_fitness_events_category ON fitness_events(event_category);

-- 5. Create fitness_event_participants table
CREATE TABLE IF NOT EXISTS fitness_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES fitness_events(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  rsvp_status VARCHAR NOT NULL DEFAULT 'invited' CHECK (rsvp_status IN ('invited', 'going', 'maybe', 'declined', 'waitlist')),
  attendance_status VARCHAR NOT NULL DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'checked_in', 'no_show')),
  checked_in_at TIMESTAMP,
  fitness_activity_id UUID REFERENCES fitness_activities(id) ON DELETE SET NULL, -- Link to logged workout
  bonus_points_awarded INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_fitness_event_participants_event_id ON fitness_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_fitness_event_participants_friend_id ON fitness_event_participants(friend_id);
CREATE INDEX IF NOT EXISTS idx_fitness_event_participants_rsvp ON fitness_event_participants(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_fitness_event_participants_attendance ON fitness_event_participants(attendance_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fitness_event_participants_activity_id ON fitness_event_participants(fitness_activity_id) WHERE fitness_activity_id IS NOT NULL;

-- 7. Create trigger to sync fitness_event_participants with activity_participants
CREATE OR REPLACE FUNCTION sync_fitness_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Sync to activity_participants when RSVP status changes to 'going'
    IF NEW.rsvp_status = 'going' THEN
      INSERT INTO activity_participants (activity_id, friend_id)
      SELECT fe.activity_id, NEW.friend_id
      FROM fitness_events fe
      WHERE fe.id = NEW.event_id
      ON CONFLICT (activity_id, friend_id) DO NOTHING;
    ELSIF NEW.rsvp_status IN ('declined', 'maybe', 'waitlist') AND OLD.rsvp_status = 'going' THEN
      -- Remove from activity_participants if changing from 'going' to other status
      DELETE FROM activity_participants ap
      USING fitness_events fe
      WHERE ap.activity_id = fe.activity_id 
        AND fe.id = NEW.event_id 
        AND ap.friend_id = NEW.friend_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove from activity_participants when participant deleted
    DELETE FROM activity_participants ap
    USING fitness_events fe
    WHERE ap.activity_id = fe.activity_id 
      AND fe.id = OLD.event_id 
      AND ap.friend_id = OLD.friend_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS sync_event_participants ON fitness_event_participants;
CREATE TRIGGER sync_event_participants
  AFTER INSERT OR UPDATE OR DELETE ON fitness_event_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_fitness_event_participants();

-- 8. Create updated_at triggers for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_fitness_events_updated_at ON fitness_events;
CREATE TRIGGER update_fitness_events_updated_at
  BEFORE UPDATE ON fitness_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fitness_event_participants_updated_at ON fitness_event_participants;
CREATE TRIGGER update_fitness_event_participants_updated_at
  BEFORE UPDATE ON fitness_event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE fitness_events IS 'Fitness event details linked to activities (group runs, rides, races, etc.)';
COMMENT ON TABLE fitness_event_participants IS 'RSVP and attendance tracking for fitness events with retroactive Strava workout linking';
COMMENT ON COLUMN fitness_event_participants.fitness_activity_id IS 'Links to the Strava workout that was auto-linked after check-in';
COMMENT ON COLUMN fitness_event_participants.bonus_points_awarded IS 'Extra points awarded for group participation';
