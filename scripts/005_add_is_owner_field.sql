-- Add is_owner field to friends table
ALTER TABLE friends ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- You can manually set one friend as the owner by running:
-- UPDATE friends SET is_owner = true WHERE name = 'Your Name';
