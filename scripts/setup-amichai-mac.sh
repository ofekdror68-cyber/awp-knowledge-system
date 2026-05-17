#!/usr/bin/env bash
# setup-amichai-mac.sh — מגדיר את עמיחי על המק (launchd + env)
# הרץ: bash scripts/setup-amichai-mac.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$HOME/.amichai-env"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_FILE="$PLIST_DIR/com.amichai.telegram.plist"
LOG_DIR="$HOME/Library/Logs/amichai"
PLIST_LABEL="com.amichai.telegram"

# ── צבעים ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅  $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️   $*${NC}"; }
err()  { echo -e "${RED}❌  $*${NC}"; }
info() { echo -e "${BLUE}ℹ️   $*${NC}"; }

echo -e "\n${BLUE}══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       הגדרת עמיחי — בוט Telegram ל-AWP             ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════${NC}\n"

# ── 1. בדיקת Node.js ──────────────────────────────────────────────────────────
NODE=$(command -v node 2>/dev/null || true)
if [[ -z "$NODE" ]]; then
  err "Node.js לא מותקן. הורד מ-https://nodejs.org ואז הרץ שוב."
  exit 1
fi
ok "Node.js נמצא: $($NODE --version)"

# ── 2. יצירת ~/.amichai-env ────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  ok "~/.amichai-env קיים"
else
  warn "~/.amichai-env לא קיים — יוצר תבנית..."
  cat > "$ENV_FILE" <<'EOF'
# עמיחי — קובץ הגדרות (אל תשתף קובץ זה!)
# מלא את הערכים האמיתיים שלך, אחד לכל שורה.

# ─── טלגרם ──────────────────────────────────────────────────────────────────
# הטוקן מ-BotFather (שלח /token ל-@BotFather)
TELEGRAM_BOT_TOKEN=your_token_here

# ה-user_id שלך (שלח /start ל-@userinfobot)
TELEGRAM_ALLOWED_USER_ID=your_user_id_here

# ─── Anthropic (Claude AI) ────────────────────────────────────────────────────
# מ-console.anthropic.com → API Keys
ANTHROPIC_API_KEY=your_anthropic_key_here

# ─── Supabase ─────────────────────────────────────────────────────────────────
# מ-app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# SUPABASE_SERVICE_ROLE_KEY=optional_service_role_key
EOF
  ok "נוצר: $ENV_FILE"
fi

# ── 3. בדיקת ערכים ──────────────────────────────────────────────────────────
source "$ENV_FILE" 2>/dev/null || true

MISSING=()
[[ -z "${TELEGRAM_BOT_TOKEN:-}"       || "$TELEGRAM_BOT_TOKEN"       == *"your_"* ]] && MISSING+=("TELEGRAM_BOT_TOKEN")
[[ -z "${TELEGRAM_ALLOWED_USER_ID:-}" || "$TELEGRAM_ALLOWED_USER_ID" == *"your_"* ]] && MISSING+=("TELEGRAM_ALLOWED_USER_ID")
[[ -z "${ANTHROPIC_API_KEY:-}"        || "$ANTHROPIC_API_KEY"         == *"your_"* ]] && MISSING+=("ANTHROPIC_API_KEY")

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo ""
  err "חסרים ערכים אמיתיים ב-$ENV_FILE:"
  for k in "${MISSING[@]}"; do echo "     • $k"; done
  echo ""
  echo -e "${YELLOW}──────────────────────────────────────────────────────${NC}"
  echo -e "${YELLOW}  איך למלא את הקובץ:${NC}"
  echo ""
  echo "  1. פתח TextEdit:"
  echo -e "     ${BLUE}open -a TextEdit $ENV_FILE${NC}"
  echo ""
  echo "  2. החלף כל שורה עם 'your_...' בערך האמיתי:"
  echo ""
  echo "     TELEGRAM_BOT_TOKEN=1234567890:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  echo "       ↑ הטוקן שקיבלת מ-@BotFather ב-Telegram"
  echo ""
  echo "     TELEGRAM_ALLOWED_USER_ID=987654321"
  echo "       ↑ ה-ID שלך — קבל אותו על-ידי שליחת /start ל-@userinfobot"
  echo ""
  echo "     ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  echo "       ↑ מ-https://console.anthropic.com/settings/keys"
  echo ""
  echo "  3. שמור (Cmd+S) וסגור"
  echo ""
  echo "  4. הרץ שוב: bash scripts/setup-amichai-mac.sh"
  echo -e "${YELLOW}──────────────────────────────────────────────────────${NC}"
  echo ""
  exit 1
fi

ok "כל הערכים ב-~/.amichai-env מלאים"

# ── 4. בדיקת תקינות הטוקן ────────────────────────────────────────────────────
info "בודק תקינות הטוקן עם Telegram..."
GET_ME=$(curl -sf "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" 2>/dev/null || echo '{"ok":false}')
BOT_OK=$(echo "$GET_ME" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('ok') else 'no')" 2>/dev/null || echo "no")

if [[ "$BOT_OK" != "yes" ]]; then
  err "הטוקן לא תקין! בדוק את TELEGRAM_BOT_TOKEN ב-~/.amichai-env"
  exit 1
fi

BOT_NAME=$(echo "$GET_ME" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['username'])" 2>/dev/null || echo "unknown")
ok "הבוט פעיל: @$BOT_NAME"

# ── 5. יצירת תיקיות ───────────────────────────────────────────────────────────
mkdir -p "$PLIST_DIR" "$LOG_DIR"
ok "תיקיות מוכנות"

# ── 6. יצירת launchd plist ────────────────────────────────────────────────────
cat > "$PLIST_FILE" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>${NODE}</string>
    <string>${REPO_DIR}/scripts/telegram-listener.js</string>
  </array>

  <!-- Load env from ~/.amichai-env -->
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>${HOME}</string>
  </dict>

  <key>WorkingDirectory</key>
  <string>${REPO_DIR}</string>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <!-- Wait for network -->
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/amichai.log</string>

  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/amichai-error.log</string>

  <key>ThrottleInterval</key>
  <integer>10</integer>
</dict>
</plist>
PLIST

ok "נוצר: $PLIST_FILE"

# ── 7. טעינת / הפעלה מחדש ────────────────────────────────────────────────────
info "טוען את ה-launchd job..."

# Unload first if already loaded (ignore errors)
launchctl unload "$PLIST_FILE" 2>/dev/null || true
sleep 1
launchctl load -w "$PLIST_FILE"

sleep 2

# ── 8. בדיקה שהתהליך רץ ─────────────────────────────────────────────────────
PID=$(launchctl list | grep "$PLIST_LABEL" | awk '{print $1}' || echo "-")

if [[ "$PID" != "-" && "$PID" != "" && "$PID" =~ ^[0-9]+$ ]]; then
  ok "עמיחי רץ ברקע (PID: $PID)"
else
  warn "לא ניתן לאמת PID — בדוק לוגים:"
  echo "    tail -f $LOG_DIR/amichai.log"
  echo "    tail -f $LOG_DIR/amichai-error.log"
fi

# ── 9. שליחת הודעת בדיקה ─────────────────────────────────────────────────────
info "שולח הודעת בדיקה לטלגרם..."
SEND=$(curl -sf \
  -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H 'Content-Type: application/json' \
  -d "{\"chat_id\":\"${TELEGRAM_ALLOWED_USER_ID}\",\"text\":\"✓ עמיחי מחובר, שלח /start כדי להתחיל\",\"parse_mode\":\"HTML\"}" \
  2>/dev/null || echo '{"ok":false}')

SEND_OK=$(echo "$SEND" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('ok') else 'no')" 2>/dev/null || echo "no")

if [[ "$SEND_OK" == "yes" ]]; then
  ok "הודעת בדיקה נשלחה בהצלחה לטלגרם! ✓"
else
  DESC=$(echo "$SEND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('description','שגיאה לא ידועה'))" 2>/dev/null || echo "שגיאה")
  err "שליחת הודעת הבדיקה נכשלה: $DESC"
  warn "בדוק שה-user_id נכון ב-TELEGRAM_ALLOWED_USER_ID"
fi

# ── סיכום ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  עמיחי מוגדר ופעיל!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo ""
echo "  📱  פתח טלגרם ושלח /start לבוט שלך"
echo "  📋  לוגים: tail -f $LOG_DIR/amichai.log"
echo "  🔄  הפעל מחדש: launchctl kickstart -k gui/\$(id -u)/$PLIST_LABEL"
echo "  🛑  עצור: launchctl unload $PLIST_FILE"
echo ""
