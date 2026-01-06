-- Create profiles table for user metadata and role
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  is_authority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste reports table
CREATE TABLE IF NOT EXISTS waste_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  description TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_address TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  rank INTEGER,
  event TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Waste reports RLS policies
CREATE POLICY "Users can view all reports" ON waste_reports
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reports" ON waste_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON waste_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authorities can update any report status" ON waste_reports
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_authority = TRUE
    )
  );

-- Create storage bucket for waste images
INSERT INTO storage.buckets (id, name, public)
VALUES ('waste-images', 'waste-images', true)
ON CONFLICT DO NOTHING;

-- Storage bucket RLS policies
CREATE POLICY "Public access to waste images" ON storage.objects
  FOR SELECT USING (bucket_id = 'waste-images');

CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'waste-images' AND auth.uid() IS NOT NULL);
