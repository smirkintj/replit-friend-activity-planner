-- Add rejection_reason field to feature_requests table
ALTER TABLE feature_requests 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

-- Update status column to include 'rejected' option
-- Note: This is a comment for documentation. The status column already exists as TEXT
-- and can accept 'rejected' as a value without schema changes.
