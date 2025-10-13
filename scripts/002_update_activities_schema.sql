-- Create activity_participants junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, friend_id)
);

-- Add linked_activity_id to activities table to link related activities
ALTER TABLE public.activities 
  ADD COLUMN IF NOT EXISTS linked_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL;

-- Enable RLS on activity_participants
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_participants
CREATE POLICY "Allow public read access to activity_participants"
  ON public.activity_participants FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on activity_participants"
  ON public.activity_participants FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id ON public.activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_friend_id ON public.activity_participants(friend_id);
CREATE INDEX IF NOT EXISTS idx_activities_linked_activity_id ON public.activities(linked_activity_id);
