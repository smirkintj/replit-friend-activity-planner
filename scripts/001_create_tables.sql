-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT NOT NULL,
  with_who TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_name TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  with_who TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for group_id
ALTER TABLE public.friends 
  ADD CONSTRAINT fk_friends_group 
  FOREIGN KEY (group_id) 
  REFERENCES public.groups(id) 
  ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view)
-- This allows friends to see the calendar without authentication

CREATE POLICY "Allow public read access to friends"
  ON public.friends FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to groups"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to activities"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to friend_requests"
  ON public.friend_requests FOR SELECT
  USING (true);

-- Create policies for public insert on friend_requests
-- This allows friends to submit their plans without authentication
CREATE POLICY "Allow public insert to friend_requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (true);

-- For admin operations (insert, update, delete), we'll handle this in the app
-- by checking the admin password. Since we don't have user auth, we'll allow
-- all operations for now and rely on the admin password check in the UI.

CREATE POLICY "Allow all operations on friends"
  ON public.friends FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on groups"
  ON public.groups FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on activities"
  ON public.activities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on friend_requests"
  ON public.friend_requests FOR ALL
  USING (true)
  WITH CHECK (true);
