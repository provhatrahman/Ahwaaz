/*
  # Create reports table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_user_id` (uuid, references profiles)
      - `reported_artist_id` (uuid, references artists)
      - `reason` (text, enum)
      - `description` (text, max 1000 chars)
      - `status` (text, enum, default 'pending')
      - `admin_notes` (text)
      - `created_date` (timestamp)
      - `updated_date` (timestamp)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for users to create reports
    - Add policies for admins to manage reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_artist_id uuid REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'fake_profile',
    'stolen_identity',
    'impersonation',
    'spam',
    'harassment',
    'other'
  )),
  description text NOT NULL CHECK (length(description) <= 1000),
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewed',
    'resolved',
    'dismissed'
  )),
  admin_notes text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_user_id = auth.uid());

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (reporter_user_id = auth.uid());

-- Admins can read all reports
CREATE POLICY "Admins can read all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_artist ON reports(reported_artist_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_date ON reports(created_date DESC);