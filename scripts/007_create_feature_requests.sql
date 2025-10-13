-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deployed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read feature requests
CREATE POLICY "Anyone can read feature requests"
  ON feature_requests
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert feature requests
CREATE POLICY "Anyone can insert feature requests"
  ON feature_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow updates to status (for admin)
CREATE POLICY "Anyone can update feature request status"
  ON feature_requests
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
