-- Add recurring activity fields
ALTER TABLE activities
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
ADD COLUMN recurrence_end_date DATE;

-- Create cancelled occurrences table for recurring activities
CREATE TABLE IF NOT EXISTS cancelled_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  cancelled_date DATE NOT NULL,
  cancelled_by TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'trip_created', 'trip_updated', 'trip_deleted', 'join_approved', 'join_rejected'
  activity_id UUID,
  activity_title TEXT,
  friend_id UUID,
  friend_name TEXT,
  details TEXT, -- JSON string with additional details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancelled_occurrences_activity_id ON cancelled_occurrences(activity_id);
