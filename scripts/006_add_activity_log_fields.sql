-- Add new fields to activity_log table for enhanced logging
ALTER TABLE activity_log
ADD COLUMN IF NOT EXISTS activity_type TEXT,
ADD COLUMN IF NOT EXISTS participant_names TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add organizer_id to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES friends(id);

-- Update existing activities to set organizer_id to the first participant
UPDATE activities
SET organizer_id = friend_id
WHERE organizer_id IS NULL;
