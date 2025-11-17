/*
  # Medicine Shop and Prescription Scanning Schema

  1. New Tables
    - `medicines`
      - `id` (uuid, primary key)
      - `name` (text, medicine name)
      - `category` (text, medicine category)
      - `price` (decimal, medicine price)
      - `in_stock` (boolean, stock availability)
      - `requires_prescription` (boolean, whether prescription is needed)
      - `description` (text, optional medicine description)
      - `created_at` (timestamptz, creation timestamp)

    - `prescriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text, prescription image URL)
      - `file_name` (text, original file name)
      - `extracted_medicines` (jsonb, list of medicines extracted from prescription)
      - `status` (text, processing status: 'pending', 'processed', 'failed')
      - `uploaded_at` (timestamptz, upload timestamp)

    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `medicine_id` (uuid, references medicines)
      - `quantity` (integer, quantity in cart)
      - `prescription_id` (uuid, optional reference to prescriptions)
      - `added_at` (timestamptz, when item was added)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Medicines table is publicly readable
*/

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10,2) NOT NULL,
  in_stock boolean DEFAULT true,
  requires_prescription boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicines"
  ON medicines FOR SELECT
  TO public
  USING (true);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  file_name text NOT NULL,
  extracted_medicines jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions"
  ON prescriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, medicine_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample medicines
INSERT INTO medicines (name, category, price, in_stock, requires_prescription, description) VALUES
  ('Paracetamol 500mg', 'Pain Relief', 5.99, true, false, 'Effective pain relief and fever reducer'),
  ('Amoxicillin 250mg', 'Antibiotic', 12.99, true, true, 'Antibiotic for bacterial infections'),
  ('Vitamin D3 Supplement', 'Vitamins', 8.99, true, false, 'Essential vitamin D supplement'),
  ('Lisinopril 10mg', 'Blood Pressure', 15.99, true, true, 'ACE inhibitor for high blood pressure'),
  ('Omega-3 Fish Oil', 'Supplements', 18.99, true, false, 'Heart-healthy omega-3 fatty acids'),
  ('Metformin 500mg', 'Diabetes', 10.99, false, true, 'Type 2 diabetes management'),
  ('Aspirin 75mg', 'Pain Relief', 4.99, true, false, 'Low-dose aspirin for daily use'),
  ('Ibuprofen 400mg', 'Pain Relief', 6.99, true, false, 'Anti-inflammatory pain reliever')
ON CONFLICT DO NOTHING;
