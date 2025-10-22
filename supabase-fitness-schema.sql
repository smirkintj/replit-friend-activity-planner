-- FitSquad Database Schema
-- Run this SQL in your Supabase SQL Editor

-- 1. Create fitness_activities table
CREATE TABLE IF NOT EXISTS fitness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('run', 'bike', 'swim', 'gym', 'yoga', 'walk', 'hike', 'other')),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  duration INTEGER NOT NULL, -- minutes
  distance DECIMAL(10, 2), -- km (optional for strength training)
  calories INTEGER,
  heart_rate INTEGER,
  points INTEGER NOT NULL DEFAULT 0,
  source VARCHAR NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'strava', 'apple_health')),
  strava_id VARCHAR,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_activities_friend_id ON fitness_activities(friend_id);
CREATE INDEX IF NOT EXISTS idx_fitness_activities_date ON fitness_activities(date);
CREATE INDEX IF NOT EXISTS idx_fitness_activities_type ON fitness_activities(type);

-- 2. Create fitness_badges table
CREATE TABLE IF NOT EXISTS fitness_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  badge_type VARCHAR NOT NULL, -- e.g., 'first_steps', 'marathon_runner', 'hot_streak'
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB -- Store additional data like { distance: 42.5, streak_days: 7 }
);

CREATE INDEX IF NOT EXISTS idx_fitness_badges_friend_id ON fitness_badges(friend_id);
CREATE INDEX IF NOT EXISTS idx_fitness_badges_type ON fitness_badges(badge_type);

-- 3. Create squad_challenges table
CREATE TABLE IF NOT EXISTS squad_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL CHECK (type IN ('distance', 'workout_count', 'streak', 'points')),
  target INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  participants UUID[] DEFAULT '{}', -- Array of friend IDs
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES friends(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_challenges_active ON squad_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_squad_challenges_dates ON squad_challenges(start_date, end_date);

-- 4. Create fitness_stats table (cached aggregates for performance)
CREATE TABLE IF NOT EXISTS fitness_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  period VARCHAR NOT NULL CHECK (period IN ('week', 'month', 'year')),
  start_date DATE NOT NULL,
  total_points INTEGER DEFAULT 0,
  total_distance DECIMAL(10, 2) DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  badges_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_stats_friend_period ON fitness_stats(friend_id, period, start_date);

-- 5. Create strava_connections table
CREATE TABLE IF NOT EXISTS strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL UNIQUE REFERENCES friends(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  scope VARCHAR NOT NULL,
  connected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_strava_connections_friend_id ON strava_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_strava_connections_athlete_id ON strava_connections(athlete_id);

-- Add helpful comments
COMMENT ON TABLE fitness_activities IS 'Stores individual workout activities for friends';
COMMENT ON TABLE fitness_badges IS 'Tracks unlocked achievement badges';
COMMENT ON TABLE squad_challenges IS 'Group fitness challenges for the squad';
COMMENT ON TABLE fitness_stats IS 'Cached weekly/monthly statistics for performance';
COMMENT ON TABLE strava_connections IS 'OAuth tokens for Strava integration per friend';
