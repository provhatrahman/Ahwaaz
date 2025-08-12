/*
  # Create artists table

  1. New Tables
    - `artists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text)
      - `location_city` (text, required)
      - `location_country` (text, required)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `primary_practice` (text, required)
      - `secondary_practices` (text array)
      - `style_genre` (text)
      - `ethnic_background` (text)
      - `bio` (text, required, max 500 chars)
      - `portfolio_links` (jsonb)
      - `custom_links` (jsonb array)
      - `profile_image_url` (text)
      - `profile_image_object_position` (text, default '50% 50%')
      - `profile_image_scale` (numeric, default 100)
      - `contact_method` (text)
      - `is_published` (boolean, default false)
      - `created_date` (timestamp)
      - `updated_date` (timestamp)

  2. Security
    - Enable RLS on `artists` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  location_city text NOT NULL,
  location_country text NOT NULL,
  latitude numeric,
  longitude numeric,
  primary_practice text NOT NULL,
  secondary_practices text[] DEFAULT '{}',
  style_genre text,
  ethnic_background text,
  bio text NOT NULL CHECK (length(bio) <= 500),
  portfolio_links jsonb DEFAULT '{}',
  custom_links jsonb[] DEFAULT '{}',
  profile_image_url text,
  profile_image_object_position text DEFAULT '50% 50%',
  profile_image_scale numeric DEFAULT 100,
  contact_method text CHECK (contact_method IN ('Email', 'Instagram', 'Website', 'Phone')),
  is_published boolean DEFAULT false,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Users can read all published artists
CREATE POLICY "Anyone can read published artists"
  ON artists
  FOR SELECT
  USING (is_published = true);

-- Users can read their own artists (published or not)
CREATE POLICY "Users can read own artists"
  ON artists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own artists
CREATE POLICY "Users can create own artists"
  ON artists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own artists
CREATE POLICY "Users can update own artists"
  ON artists
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own artists
CREATE POLICY "Users can delete own artists"
  ON artists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all artists
CREATE POLICY "Admins can read all artists"
  ON artists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_published ON artists(is_published);
CREATE INDEX IF NOT EXISTS idx_artists_location ON artists(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_artists_practice ON artists(primary_practice);
CREATE INDEX IF NOT EXISTS idx_artists_created_date ON artists(created_date DESC);