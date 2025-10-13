-- Add budget breakdown field to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS budget_breakdown JSONB;

-- Update existing activities to have empty budget breakdown
UPDATE activities SET budget_breakdown = '[]'::jsonb WHERE budget_breakdown IS NULL;
