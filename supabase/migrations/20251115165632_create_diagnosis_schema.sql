/*
  # Create Diagnosis Tables
  
  1. New Tables
    - `diagnoses`: Store user diagnosis records
    - `diagnosis_reports`: Store uploaded medical reports
    - `diagnosis_images`: Store uploaded medical images
  
  2. Security: RLS enabled for user data privacy
*/

CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  symptoms text,
  description text,
  diagnosis_result text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnosis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id uuid NOT NULL REFERENCES diagnoses(id),
  report_title text NOT NULL,
  report_url text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnosis_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id uuid NOT NULL REFERENCES diagnoses(id),
  image_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own diagnoses" ON diagnoses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create diagnoses" ON diagnoses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own diagnoses" ON diagnoses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own diagnoses" ON diagnoses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users view own reports" ON diagnosis_reports FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_reports.diagnosis_id AND diagnoses.user_id = auth.uid()));
CREATE POLICY "Users create reports" ON diagnosis_reports FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_reports.diagnosis_id AND diagnoses.user_id = auth.uid()));
CREATE POLICY "Users delete own reports" ON diagnosis_reports FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_reports.diagnosis_id AND diagnoses.user_id = auth.uid()));

CREATE POLICY "Users view own images" ON diagnosis_images FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_images.diagnosis_id AND diagnoses.user_id = auth.uid()));
CREATE POLICY "Users create images" ON diagnosis_images FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_images.diagnosis_id AND diagnoses.user_id = auth.uid()));
CREATE POLICY "Users delete own images" ON diagnosis_images FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM diagnoses WHERE diagnoses.id = diagnosis_images.diagnosis_id AND diagnoses.user_id = auth.uid()));
