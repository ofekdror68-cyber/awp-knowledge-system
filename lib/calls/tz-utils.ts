export function toJerusalemHour(utc: Date): { hour: number; minute: number } {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = Object.fromEntries(f.formatToParts(utc).map(p => [p.type, p.value]))
  return {
    hour:   parseInt(parts.hour) % 24,
    minute: parseInt(parts.minute),
  }
}
