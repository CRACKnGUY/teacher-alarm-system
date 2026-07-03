-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  period_time TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_slots_day_period ON slots (day, period_time);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON slots
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  day TEXT NOT NULL,
  period_time TEXT NOT NULL
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON attendance
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  period_time TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON alarms
  FOR ALL USING (true) WITH CHECK (true);
