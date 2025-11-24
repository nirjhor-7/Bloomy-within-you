/*
  # Create mood entries table

  1. New Tables
    - `mood_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mood` (text - one of: happy, calm, neutral, sad, anxious, energized)
      - `date` (date)
      - `note` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mood_entries` table
    - Users can only view/edit their own mood entries

  3. Notes
    - One entry per user per date
    - Indexed by user_id and date for efficient queries
*/

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood text NOT NULL,
  date date NOT NULL,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date);
