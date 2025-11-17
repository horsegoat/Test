/*
  # Create Doctors Table

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `name` (text, doctor's full name)
      - `specialty` (text, medical specialty)
      - `qualifications` (text, academic qualifications)
      - `position` (text, job position/title)
      - `experience_years` (integer, years of experience)
      - `rating` (numeric, doctor rating out of 5)
      - `patients_count` (integer, number of patients treated)
      - `available` (boolean, availability status)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on `doctors` table
    - Add policy for public read access (anyone can view doctors)
    - Add policy for authenticated users to read (for consistency)
*/

CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  qualifications text NOT NULL,
  position text NOT NULL,
  experience_years integer NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  patients_count integer NOT NULL DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
  ON doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert doctors"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update doctors"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Only admins can delete doctors"
  ON doctors
  FOR DELETE
  TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(available);
