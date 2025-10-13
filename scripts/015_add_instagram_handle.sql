-- Add instagram_handle column to friends table
ALTER TABLE friends ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
