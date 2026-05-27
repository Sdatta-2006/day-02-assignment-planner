/*
  # Create assignments table

  1. New Tables
    - `assignments`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `due_date` (date, not null)
      - `priority` (text, not null) - 'low', 'medium', or 'high'
      - `completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `assignments` table
    - Public access for all operations (simpler for this app demo)
*/

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Allow public access for this demo app
CREATE POLICY "Public read access"
  ON assignments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert access"
  ON assignments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON assignments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access"
  ON assignments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create index for sorting by due date
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON assignments (due_date);
