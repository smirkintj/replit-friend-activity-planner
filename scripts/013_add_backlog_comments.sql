-- Add comments table for backlog items
CREATE TABLE IF NOT EXISTS backlog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backlog_item_id TEXT NOT NULL,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add detailed_description field to backlog_items for AI-suggested ideas
ALTER TABLE backlog_items ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_backlog_comments_item_id ON backlog_comments(backlog_item_id);
