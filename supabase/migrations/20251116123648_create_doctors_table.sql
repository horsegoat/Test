/*
  # Create Doctors Table

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key) - Unique identifier for each doctor
      - `name` (text) - Full name of the doctor
      - `qualifications` (text) - Medical qualifications and degrees
      - `specialty` (text) - Medical specialty/department
      - `position` (text) - Position/title at the hospital
      - `experience_years` (integer) - Years of experience (optional)
      - `consultation_fee` (decimal) - Consultation fee (optional)
      - `available` (boolean) - Availability status
      - `rating` (decimal) - Doctor rating (default 4.5)
      - `patients_count` (integer) - Number of patients treated (default 0)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `doctors` table
    - Add policy for public read access (anyone can view doctors)
    - Add policy for authenticated users to read doctors
*/

CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  qualifications text,
  specialty text NOT NULL,
  position text,
  experience_years integer,
  consultation_fee decimal(10, 2),
  available boolean DEFAULT true,
  rating decimal(2, 1) DEFAULT 4.5,
  patients_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
  ON doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can view doctors"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (true);