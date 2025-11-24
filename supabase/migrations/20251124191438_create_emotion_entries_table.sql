/*
  # Create emotion entries table

  1. New Tables
    - `emotion_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `emotion` (text - emotion name)
      - `intensity` (integer, 1-10)
      - `note` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `emotion_entries` table
    - Users can only view/edit their own emotion entries

  3. Notes
    - Multiple entries per day allowed (time-series data)
    - Indexed by user_id and created_at for efficient queries
*/

CREATE TABLE IF NOT EXISTS emotion_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  intensity integer NOT NULL DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emotion entries"
  ON emotion_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion entries"
  ON emotion_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotion entries"
  ON emotion_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotion entries"
  ON emotion_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_emotion_entries_user_created ON emotion_entries(user_id, created_at);
