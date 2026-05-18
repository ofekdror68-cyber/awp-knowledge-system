#!/usr/bin/env bash
# connect-telegram.sh — מגדיר ושולח הודעת בדיקה בפעולה אחת
# הרץ בטרמינל על המק: bash scripts/connect-telegram.sh
set -euo pipefail

ENV_FILE="$HOME/.amichai-env"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.amichai.telegram.plist"
LOG_DIR="$HOME/Library/Logs/amichai"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(command -v node 2>/dev/null || true)"

# צבעים
G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; B='\033[0;34m'; N='\033[0m'
ok()   { echo -e "${G}✅  $*${N}"; }
err()  { echo -e "${R}❌  $*${N}"; exit 1; }
warn() { echo -e "${Y}⚠️   $*${N}"; }
info() { echo -e "${B}ℹ️   $*${N}"; }
ask()  { echo -en "${B}👉  $1:${N} "; }

echo -e "\n${B}══════════════════════════════════════════════════════${N}"
echo -e "${B}          חיבור עמיחי לטלגרם — הגדרה מהירה           ${N}"
echo -e "${B}══════════════════════════════════════════════════════${N}\n"

# ── בדיקת Node.js ─────────────────────────────────────────────────────────────
if [[ -z "$NODE_BIN" ]]; then
  # נסה מיקומים נפוצים של nvm / brew
  for p in "$HOME/.nvm/versions/node"/*/bin/node /opt/homebrew/bin/node /usr/local/bin/node; do
    [[ -x "$p" ]] && NODE_BIN="$p" && break
  done
fi
[[ -z "$NODE_BIN" ]] && err "Node.js לא מותקן. הורד מ-https://nodejs.org ואז הרץ שוב."
ok "Node.js נמצא ($($NODE_BIN --version))"

# ── טען ערכים קיימים מהקובץ (אם יש) ──────────────────────────────────────────
load_env() {
  [[ ! -f "$ENV_FILE" ]] && return
  while IFS= read -r line; do
    line="${line%%#*}"            # הסר הערות
    [[ -z "$line" ]] && continue
    [[ "$line" != *=* ]] && continue
    key="${line%%=*}"; val="${line#*=}"
    key="${key// /}"; val="${val// /}"
    [[ -n "$key" && -n "$val" ]] && export "$key"="$val" 2>/dev/null || true
  done < "$ENV_FILE"
}
load_env

is_real() { [[ -n "${1:-}" && "${1:-}" != *your_* && "${1:-}" != *xxx* ]]; }

# ── קבל token ─────────────────────────────────────────────────────────────────
if is_real "${TELEGRAM_BOT_TOKEN:-}"; then
  ok "TELEGRAM_BOT_TOKEN נמצא בקובץ הגדרות"
else
  echo ""
  echo "  כדי לקבל את הטוקן:"
  echo "  1. פתח Telegram"
  echo "  2. חפש @BotFather"
  echo "  3. שלח: /mybots  ← בחר את הבוט שלך ← API Token"
  echo ""
  ask "הדבק את הטוקן של הבוט (מ-BotFather)"
  read -r TELEGRAM_BOT_TOKEN
  TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN// /}"
fi

# ── אמת token ─────────────────────────────────────────────────────────────────
info "בודק תקינות הטוקן..."
GET_ME=$(curl -sf --max-time 10 \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" 2>/dev/null || echo '{"ok":false,"description":"network error"}')

BOT_OK=$(echo "$GET_ME" | python3 -c "import sys,json;d=json.load(sys.stdin);print('yes' if d.get('ok') else 'no')" 2>/dev/null || echo "no")

if [[ "$BOT_OK" != "yes" ]]; then
  DESC=$(echo "$GET_ME" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('description','unknown'))" 2>/dev/null || echo "unknown")
  err "הטוקן לא תקין: $DESC\nבדוק שהעתקת אותו נכון מ-BotFather (כולל המספרים לפני הנקודותיים)"
fi

BOT_NAME=$(echo "$GET_ME" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['result']['username'])" 2>/dev/null || echo "?")
ok "הבוט תקין: @$BOT_NAME"

# ── קבל user_id ───────────────────────────────────────────────────────────────
if is_real "${TELEGRAM_ALLOWED_USER_ID:-}"; then
  ok "TELEGRAM_ALLOWED_USER_ID נמצא בקובץ הגדרות"
else
  echo ""
  echo "  כדי לקבל את ה-user_id שלך:"
  echo "  1. פתח Telegram"
  echo "  2. חפש @userinfobot"
  echo "  3. שלח לו /start — הוא יחזיר מספר כמו 123456789"
  echo ""
  ask "הדבק את ה-user_id שלך (מספר בלבד)"
  read -r TELEGRAM_ALLOWED_USER_ID
  TELEGRAM_ALLOWED_USER_ID="${TELEGRAM_ALLOWED_USER_ID// /}"
fi

[[ ! "$TELEGRAM_ALLOWED_USER_ID" =~ ^[0-9]+$ ]] && err "user_id חייב להיות מספר בלבד (לדוג': 123456789)"

# ── קבל Anthropic key ─────────────────────────────────────────────────────────
if is_real "${ANTHROPIC_API_KEY:-}"; then
  ok "ANTHROPIC_API_KEY נמצא בקובץ הגדרות"
else
  echo ""
  echo "  כדי לקבל את מפתח Anthropic:"
  echo "  → https://console.anthropic.com/settings/keys"
  echo ""
  ask "הדבק את ANTHROPIC_API_KEY (sk-ant-...)"
  read -r ANTHROPIC_API_KEY
  ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY// /}"
fi

# ── שמור לקובץ ─────────────────────────────────────────────────────────────────
cat > "$ENV_FILE" <<EOF
# עמיחי — credentials (אל תשתף קובץ זה)
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_ALLOWED_USER_ID=${TELEGRAM_ALLOWED_USER_ID}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
EOF
chmod 600 "$ENV_FILE"
ok "נשמר: $ENV_FILE (מוגן מקריאה)"

# ── שלח הודעת בדיקה ───────────────────────────────────────────────────────────
info "שולח הודעת בדיקה לטלגרם..."
SEND=$(curl -sf --max-time 10 \
  -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H 'Content-Type: application/json' \
  -d "{\"chat_id\":\"${TELEGRAM_ALLOWED_USER_ID}\",\"text\":\"✓ עמיחי מחובר, שלח /start כדי להתחיל\",\"parse_mode\":\"HTML\"}" \
  2>/dev/null || echo '{"ok":false,"description":"network error"}')

SEND_OK=$(echo "$SEND" | python3 -c "import sys,json;d=json.load(sys.stdin);print('yes' if d.get('ok') else 'no')" 2>/dev/null || echo "no")

if [[ "$SEND_OK" != "yes" ]]; then
  DESC=$(echo "$SEND" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('description','unknown'))" 2>/dev/null || echo "unknown")
  warn "שליחת ההודעה נכשלה: $DESC"
  echo ""
  echo "  סיבות אפשריות:"
  echo "  • לא שלחת /start לבוט מעולם — שלח /start ל-@${BOT_NAME} קודם"
  echo "  • ה-user_id שגוי — בדוק שוב ב-@userinfobot"
  echo ""
  ask "האם שלחת /start לבוט ב-Telegram? (y/n)"
  read -r STARTED
  if [[ "${STARTED:-n}" == "y" ]]; then
    info "מנסה שוב..."
    SEND2=$(curl -sf --max-time 10 \
      -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -H 'Content-Type: application/json' \
      -d "{\"chat_id\":\"${TELEGRAM_ALLOWED_USER_ID}\",\"text\":\"✓ עמיחי מחובר, שלח /start כדי להתחיל\"}" \
      2>/dev/null || echo '{"ok":false}')
    SEND2_OK=$(echo "$SEND2" | python3 -c "import sys,json;d=json.load(sys.stdin);print('yes' if d.get('ok') else 'no')" 2>/dev/null || echo "no")
    [[ "$SEND2_OK" == "yes" ]] && ok "ההודעה נשלחה! בדוק טלגרם." || warn "עדיין נכשל — בדוק שה-user_id נכון: ${TELEGRAM_ALLOWED_USER_ID}"
  else
    echo "  → פתח Telegram ושלח /start ל-@${BOT_NAME}, ואז הרץ שוב."
  fi
else
  ok "ההודעה נשלחה! בדוק טלגרם — צריכה להופיע עכשיו ✓"
fi

# ── הגדרת launchd (הפעלה אוטומטית) ───────────────────────────────────────────
mkdir -p "$PLIST_DIR" "$LOG_DIR"

cat > "$PLIST_FILE" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.amichai.telegram</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE_BIN}</string>
    <string>${REPO_DIR}/scripts/telegram-listener.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key><string>${HOME}</string>
    <key>TELEGRAM_BOT_TOKEN</key><string>${TELEGRAM_BOT_TOKEN}</string>
    <key>TELEGRAM_ALLOWED_USER_ID</key><string>${TELEGRAM_ALLOWED_USER_ID}</string>
    <key>ANTHROPIC_API_KEY</key><string>${ANTHROPIC_API_KEY}</string>
    <key>NEXT_PUBLIC_SUPABASE_URL</key><string>${NEXT_PUBLIC_SUPABASE_URL:-}</string>
    <key>NEXT_PUBLIC_SUPABASE_ANON_KEY</key><string>${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}</string>
    <key>SUPABASE_SERVICE_ROLE_KEY</key><string>${SUPABASE_SERVICE_ROLE_KEY:-}</string>
  </dict>
  <key>WorkingDirectory</key>
  <string>${REPO_DIR}</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>${LOG_DIR}/amichai.log</string>
  <key>StandardErrorPath</key><string>${LOG_DIR}/amichai-error.log</string>
</dict>
</plist>
PLIST

# טען / הפעל מחדש
launchctl unload "$PLIST_FILE" 2>/dev/null || true
sleep 1
launchctl load -w "$PLIST_FILE"
sleep 2

PID=$(launchctl list 2>/dev/null | awk '/com\.amichai\.telegram/{print $1}' || echo "")
if [[ "$PID" =~ ^[0-9]+$ ]]; then
  ok "עמיחי רץ ברקע (PID: $PID) ✓"
else
  warn "הבוט יעלה בפעם הבאה שתפתח מק. לוגים: tail -f ${LOG_DIR}/amichai.log"
fi

echo ""
echo -e "${G}══════════════════════════════════════════════════════${N}"
echo -e "${G}  ✅  הכל מוכן! שלח /start ל-@${BOT_NAME} בטלגרם  ${N}"
echo -e "${G}══════════════════════════════════════════════════════${N}"
echo ""
echo "  לוגים:    tail -f ${LOG_DIR}/amichai.log"
echo "  לעצור:   launchctl unload ${PLIST_FILE}"
echo ""
