-- Telegram bot conversation history
-- Stores the last N messages per chat_id to give Claude conversation context.

CREATE TABLE IF NOT EXISTS telegram_conversation_history (
  id          BIGSERIAL PRIMARY KEY,
  chat_id     TEXT        NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_history_chat
  ON telegram_conversation_history (chat_id, created_at);

-- RLS: open policy (internal tool, bot uses service-role key)
ALTER TABLE telegram_conversation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all" ON telegram_conversation_history FOR ALL USING (true) WITH CHECK (true);
