CREATE TABLE IF NOT EXISTS alarm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  day TEXT NOT NULL DEFAULT '',
  period_time TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 seconds',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE alarm_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON alarm_events
  FOR ALL USING (true) WITH CHECK (true);
