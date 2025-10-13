-- Add PIN column to friends table
ALTER TABLE public.friends 
ADD COLUMN IF NOT EXISTS pin TEXT;

-- Create index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_friends_pin ON public.friends(pin);
