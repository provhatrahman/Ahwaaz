/*
  # Create feedback table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text, enum)
      - `title` (text, max 200 chars)
      - `description` (text, max 2000 chars)
      - `priority` (text, enum, default 'medium')
      - `status` (text, enum, default 'new')
      - `admin_response` (text)
      - `created_date` (timestamp)
      - `updated_date` (timestamp)

  2. Security
    - Enable RLS on `feedback` table
    - Add policies for users to create and read their feedback
    - Add policies for admins to manage all feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'bug_report',
    'feature_request',
    'general_feedback',
    'complaint'
  )),
  title text NOT NULL CHECK (length(title) <= 200),
  description text NOT NULL CHECK (length(description) <= 2000),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'new' CHECK (status IN (
    'new',
    'under_review',
    'planned',
    'in_progress',
    'completed',
    'closed'
  )),
  admin_response text,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can create feedback
CREATE POLICY "Authenticated users can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update feedback
CREATE POLICY "Admins can update feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_created_date ON feedback(created_date DESC);