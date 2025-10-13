-- Create join_requests table for users to request to join activities
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  probability TEXT NOT NULL CHECK (probability IN ('confirmed', 'maybe', 'unlikely')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, friend_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_join_requests_activity ON join_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_friend ON join_requests(friend_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
