-- Change all "busy" activity types to "trip"
UPDATE public.activities 
SET type = 'trip' 
WHERE type = 'busy';

-- Add budget and itinerary fields to activities table
ALTER TABLE public.activities 
  ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS itinerary TEXT;

-- Update friend_requests table to change "busy" to "trip"
UPDATE public.friend_requests 
SET activity_type = 'trip' 
WHERE activity_type = 'busy';
