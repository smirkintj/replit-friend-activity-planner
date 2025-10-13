-- Add quote field to friends table
ALTER TABLE friends ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE friends ADD CONSTRAINT quote_length CHECK (char_length(quote) <= 35);

-- Create backlog_items table for admin-created backlog ideas
CREATE TABLE IF NOT EXISTS backlog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  complexity TEXT NOT NULL CHECK (complexity IN ('Low', 'Medium', 'High')),
  impact TEXT NOT NULL CHECK (impact IN ('Low', 'Medium', 'High')),
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('ai', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create backlog_votes table for voting on backlog items
CREATE TABLE IF NOT EXISTS backlog_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backlog_item_id UUID REFERENCES backlog_items(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(backlog_item_id, friend_id)
);
