-- Missed calls tracking for ofek-crm Telegram alerts
-- Window logic: daily windows start at 13:20 Jerusalem time

CREATE TABLE IF NOT EXISTS missed_calls (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id          TEXT        UNIQUE NOT NULL,
  phone_number     TEXT        NOT NULL,
  called_at        TIMESTAMPTZ NOT NULL,
  missed_reason    TEXT        NOT NULL CHECK (missed_reason IN ('no_dtmf', 'no_agent')),
  -- window_start: the UTC timestamp of the 13:20 Jerusalem that opened this window
  window_start     TIMESTAMPTZ NOT NULL,
  callback_at      TIMESTAMPTZ,
  callback_by      TEXT        CHECK (callback_by IN ('midan', 'shai', 'meir')),
  status           TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notified_immediately BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS missed_calls_window_start_idx ON missed_calls (window_start);
CREATE INDEX IF NOT EXISTS missed_calls_status_idx       ON missed_calls (status);
CREATE INDEX IF NOT EXISTS missed_calls_phone_idx        ON missed_calls (phone_number);
CREATE INDEX IF NOT EXISTS missed_calls_called_at_idx    ON missed_calls (called_at DESC);

-- Deduplication table for cron summaries so DST double-triggers don't double-send
CREATE TABLE IF NOT EXISTS cron_runs (
  run_key  TEXT        PRIMARY KEY,
  ran_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE missed_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_runs    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access missed_calls" ON missed_calls
  USING (true) WITH CHECK (true);

CREATE POLICY "service role full access cron_runs" ON cron_runs
  USING (true) WITH CHECK (true);
