const TG_API = 'https://api.telegram.org'

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID — message not sent')
    console.log('[Telegram] Would send:\n', text)
    return
  }

  const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[Telegram] API error:', res.status, body)
    throw new Error(`Telegram API error ${res.status}: ${body}`)
  }
}
