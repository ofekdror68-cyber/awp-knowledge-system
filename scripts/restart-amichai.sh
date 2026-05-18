#!/usr/bin/env bash
# restart-amichai.sh — הורג את הבוט הישן ומפעיל את הגרסה החדשה
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.amichai.telegram.plist"
LOG="$HOME/Library/Logs/amichai/amichai.log"
NODE_BIN="$(command -v node 2>/dev/null || true)"

G='\033[0;32m'; R='\033[0;31m'; N='\033[0m'
ok()  { echo -e "${G}✅  $*${N}"; }
err() { echo -e "${R}❌  $*${N}"; }

echo ""
echo "🔄  מאתחל עמיחי..."

# 1. הרוג כל תהליך bot.js / telegram-listener.js קיים
for proc in bot.js telegram-listener.js; do
  PIDS=$(pgrep -f "$proc" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "   הורג תהליך: $proc ($PIDS)"
    kill $PIDS 2>/dev/null || true
    sleep 1
  fi
done
ok "תהליכים ישנים נוקו"

# 2. עדכן קוד מ-git
cd "$REPO_DIR"
git fetch origin claude/fix-telegram-bot-UPzb0 --quiet 2>/dev/null || true
git checkout claude/fix-telegram-bot-UPzb0 --quiet 2>/dev/null || true
git pull origin claude/fix-telegram-bot-UPzb0 --quiet 2>/dev/null || true
ok "קוד מעודכן"

# 3. אם יש plist — reload
if [[ -f "$PLIST" ]]; then
  launchctl unload "$PLIST" 2>/dev/null || true
  sleep 1

  # עדכן נתיב node בתוך ה-plist אם השתנה
  if [[ -n "$NODE_BIN" ]]; then
    sed -i '' "s|<string>/.*node</string>|<string>${NODE_BIN}</string>|g" "$PLIST" 2>/dev/null || true
  fi

  launchctl load -w "$PLIST"
  sleep 2
  PID=$(launchctl list 2>/dev/null | awk '/com\.amichai\.telegram/{print $1}' || echo "")
  if [[ "$PID" =~ ^[0-9]+$ ]]; then
    ok "עמיחי רץ (PID: $PID)"
  else
    err "launchd לא הפעיל — מריץ ישירות"
    nohup "$NODE_BIN" "$REPO_DIR/scripts/telegram-listener.js" >> "$LOG" 2>&1 &
    ok "עמיחי רץ ברקע (PID: $!)"
  fi
else
  # אין plist — הרץ ישירות ברקע
  mkdir -p "$(dirname "$LOG")"
  nohup "$NODE_BIN" "$REPO_DIR/scripts/telegram-listener.js" >> "$LOG" 2>&1 &
  ok "עמיחי רץ ברקע (PID: $!) — לוג: $LOG"
fi

echo ""
echo "  לוג בזמן אמת: tail -f $LOG"
echo ""
