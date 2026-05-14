interface Env {
  ANTHROPIC_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OWNER_CHAT_ID: string;
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `אתה העוזר האישי של אופק, בעל "אופק גיזום והשכרת במות".

יכולות שלך:
1. **CRM** - יש לך כלים לבדוק שיחות, סוכנים, סיכומים יומיים, אנשי קשר
2. **שיחה כללית** - אתה יכול לעזור גם בכל דבר אחר: לכתוב הודעות, לחשב, לתת עצות, להסביר, לתכנן, וכו'

הסוכנים: מידן (555256200), שי (DTMF=2), מאיר (555256202).

הנחיות:
- ענה תמיד בעברית, קצר וממוקד
- אם השאלה דורשת נתוני CRM → קרא לכלי המתאים
- אם זו שאלה כללית → ענה ישר מהידע שלך, אל תקרא לכלים מיותרים
- אל תתנצל ואל תגיד "אני רק יכול לעזור עם CRM" — אתה יכול לעזור בהכל
- הימנע מהקדמות ארוכות`;

// ---------------------------------------------------------------------------
// CRM tools definition
// ---------------------------------------------------------------------------

const CRM_TOOLS = [
  {
    name: 'get_missed_calls',
    description: 'מחזיר שיחות שלא נענו. השתמש כשנשאלים על שיחות שלא נענו, מיסד קולות, לקוחות שהתקשרו ולא קיבלו מענה.',
    input_schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'תאריך בפורמט YYYY-MM-DD. ברירת מחדל: היום'
        },
        agent_id: {
          type: 'string',
          description: 'מזהה סוכן לסינון (אופציונלי)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_daily_summary',
    description: 'מחזיר סיכום יומי של כל השיחות: כמה התקשרו, כמה נענו, כמה לא. השתמש כשנשאלים על סיכום, סטטיסטיקה, כמה שיחות היו.',
    input_schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'תאריך בפורמט YYYY-MM-DD. ברירת מחדל: היום'
        }
      },
      required: []
    }
  },
  {
    name: 'get_agents',
    description: 'מחזיר מידע על הסוכנים ופעילותם: כמה שיחות עשו, כמה פספסו. השתמש כשנשאלים על סוכנים, ביצועים, מי עשה הכי הרבה שיחות.',
    input_schema: {
      type: 'object',
      properties: {
        date_from: {
          type: 'string',
          description: 'תאריך התחלה בפורמט YYYY-MM-DD (אופציונלי, ברירת מחדל: תחילת החודש)'
        },
        date_to: {
          type: 'string',
          description: 'תאריך סיום בפורמט YYYY-MM-DD (אופציונלי, ברירת מחדל: היום)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_contacts',
    description: 'מחזיר אנשי קשר ולקוחות ממאגר ה-CRM. השתמש כשמחפשים לקוח, מספר טלפון, פרטי קשר.',
    input_schema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'חיפוש לפי שם, טלפון או חברה'
        },
        limit: {
          type: 'number',
          description: 'מספר תוצאות מקסימלי. ברירת מחדל: 10'
        }
      },
      required: []
    }
  }
];

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

function supabaseHeaders(env: Env): Record<string, string> {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
}

async function supabaseGet<T>(url: string, env: Env): Promise<T[]> {
  try {
    const resp = await fetch(url, { headers: supabaseHeaders(env) });
    if (!resp.ok) {
      console.error(`[SUPABASE] GET ${url} → ${resp.status}`);
      return [];
    }
    return resp.json() as Promise<T[]>;
  } catch (e) {
    console.error('[SUPABASE] fetch error:', e);
    return [];
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function startOfMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// ---------------------------------------------------------------------------
// CRM tool execution
// ---------------------------------------------------------------------------

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  env: Env
): Promise<string> {
  const base = env.SUPABASE_URL;
  console.log(`[TOOL] executing ${name}`, input);

  try {
    switch (name) {
      case 'get_missed_calls': {
        const date = (input.date as string) || todayISO();
        const agentFilter = input.agent_id
          ? `&agent_id=eq.${encodeURIComponent(input.agent_id as string)}`
          : '';
        const url = `${base}/rest/v1/calls?date=eq.${date}&status=eq.missed${agentFilter}&order=created_at.desc&limit=50`;
        const calls = await supabaseGet<Record<string, unknown>>(url, env);

        if (!calls.length) {
          return `לא נמצאו שיחות שלא נענו בתאריך ${date}.`;
        }

        const lines = calls.slice(0, 15).map((c) => {
          const phone = (c.phone || c.caller_number || c.caller_id || 'לא ידוע') as string;
          const time = (c.time || c.call_time || c.created_at || '') as string;
          const displayTime = time.length > 10 ? time.substring(11, 16) : time;
          return `• ${phone}${displayTime ? ` בשעה ${displayTime}` : ''}`;
        });

        return (
          `שיחות שלא נענו ב-${date}: ${calls.length} שיחות\n` +
          lines.join('\n') +
          (calls.length > 15 ? `\n...ועוד ${calls.length - 15}` : '')
        );
      }

      case 'get_daily_summary': {
        const date = (input.date as string) || todayISO();

        // Try dedicated summary table first
        const summaryUrl = `${base}/rest/v1/daily_summaries?date=eq.${date}&limit=1`;
        const summaries = await supabaseGet<Record<string, unknown>>(summaryUrl, env);

        if (summaries.length) {
          const s = summaries[0];
          return (
            `סיכום יומי — ${date}:\n` +
            `📞 סה"כ שיחות: ${s.total_calls ?? 0}\n` +
            `✅ נענו: ${s.answered_calls ?? 0}\n` +
            `❌ לא נענו: ${s.missed_calls ?? 0}\n` +
            (s.avg_duration ? `⏱ ממוצע זמן שיחה: ${s.avg_duration} שניות` : '')
          );
        }

        // Fallback: calculate from calls table
        const callsUrl = `${base}/rest/v1/calls?date=eq.${date}`;
        const calls = await supabaseGet<Record<string, unknown>>(callsUrl, env);
        const missed = calls.filter((c) => c.status === 'missed').length;
        const answered = calls.filter((c) => c.status === 'answered').length;

        return (
          `סיכום יומי — ${date}:\n` +
          `📞 סה"כ שיחות: ${calls.length}\n` +
          `✅ נענו: ${answered}\n` +
          `❌ לא נענו: ${missed}`
        );
      }

      case 'get_agents': {
        const dateFrom = (input.date_from as string) || startOfMonthISO();
        const dateTo = (input.date_to as string) || todayISO();

        const agentsUrl = `${base}/rest/v1/agents?select=*&limit=20`;
        const agents = await supabaseGet<Record<string, unknown>>(agentsUrl, env);

        // Static fallback from task spec
        const knownAgents = [
          { name: 'מידן', phone: '555256200' },
          { name: 'שי', phone: 'DTMF=2' },
          { name: 'מאיר', phone: '555256202' }
        ];

        if (!agents.length) {
          return (
            `סוכנים (${dateFrom} עד ${dateTo}):\n` +
            knownAgents.map((a) => `• ${a.name} (${a.phone})`).join('\n') +
            '\n(נתוני פעילות מפורטים לא זמינים)'
          );
        }

        return (
          `סוכנים ופעילותם (${dateFrom} עד ${dateTo}):\n` +
          agents
            .map(
              (a) =>
                `• ${a.name ?? a.id}: ${a.total_calls ?? 0} שיחות, ` +
                `${a.missed_calls ?? 0} לא נענו`
            )
            .join('\n')
        );
      }

      case 'get_contacts': {
        const search = input.search as string | undefined;
        const limit = (input.limit as number) || 10;
        let url = `${base}/rest/v1/contacts?limit=${limit}&order=name.asc`;

        if (search) {
          const q = encodeURIComponent(search);
          url += `&or=(name.ilike.*${q}*,phone.ilike.*${q}*,company.ilike.*${q}*)`;
        }

        const contacts = await supabaseGet<Record<string, unknown>>(url, env);

        if (!contacts.length) {
          return search
            ? `לא נמצאו אנשי קשר עם "${search}"`
            : 'אין אנשי קשר במערכת';
        }

        return (
          `אנשי קשר${search ? ` (חיפוש: "${search}")` : ''}:\n` +
          contacts
            .map((c) => {
              const name = (c.name || 'ללא שם') as string;
              const phone = (c.phone || '') as string;
              const company = c.company ? ` (${c.company})` : '';
              return `• ${name} — ${phone}${company}`;
            })
            .join('\n')
        );
      }

      default:
        return `כלי "${name}" לא מוכר`;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[TOOL] ${name} error:`, msg);
    return `שגיאה בביצוע הכלי ${name}: ${msg}`;
  }
}

// ---------------------------------------------------------------------------
// Conversation history (Supabase)
// ---------------------------------------------------------------------------

type MessageContent = string | Array<Record<string, unknown>>;

interface HistoryRow {
  role: string;
  content: MessageContent;
}

async function getConversationHistory(chatId: string, env: Env): Promise<HistoryRow[]> {
  const url =
    `${env.SUPABASE_URL}/rest/v1/telegram_conversation_history` +
    `?chat_id=eq.${chatId}&order=created_at.desc&limit=20`;
  const rows = await supabaseGet<HistoryRow>(url, env);
  return rows.reverse();
}

async function saveMessage(
  chatId: string,
  role: string,
  content: MessageContent,
  env: Env
): Promise<void> {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/telegram_conversation_history`, {
      method: 'POST',
      headers: { ...supabaseHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({ chat_id: chatId, role, content })
    });
  } catch (e) {
    console.error('[HISTORY] save error:', e);
  }
}

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

async function sendTelegramMessage(env: Env, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('[TELEGRAM] sendMessage error:', e);
  }
}

async function sendTypingAction(env: Env, chatId: string): Promise<void> {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendChatAction`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' })
    });
  } catch {
    // non-critical
  }
}

// ---------------------------------------------------------------------------
// Anthropic types (minimal)
// ---------------------------------------------------------------------------

interface AnthropicContentBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface AnthropicResponse {
  stop_reason: string;
  content: AnthropicContentBlock[];
}

// ---------------------------------------------------------------------------
// Core handler: message → Claude (with tool loop) → reply
// ---------------------------------------------------------------------------

async function handleTelegramMessage(text: string, chatId: string, env: Env): Promise<void> {
  console.log(`[TELEGRAM] chat_id=${chatId} text="${text.substring(0, 120)}"`);

  // /reset command
  if (text.trim() === '/reset') {
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/telegram_conversation_history?chat_id=eq.${chatId}`,
      { method: 'DELETE', headers: supabaseHeaders(env) }
    );
    await sendTelegramMessage(env, chatId, '✅ ההיסטוריה נמחקה. נתחיל מחדש.');
    return;
  }

  // Send typing indicator immediately
  await sendTypingAction(env, chatId);

  // Load conversation history and save the new user message
  const history = await getConversationHistory(chatId, env);
  await saveMessage(chatId, 'user', text, env);

  // Build messages array for Claude
  const messages: Array<{ role: string; content: MessageContent }> = [
    ...history,
    { role: 'user', content: text }
  ];

  // Agentic loop
  let iterCount = 0;
  const MAX_ITERS = 5;

  let data = await callClaude(messages, env);

  while (data.stop_reason === 'tool_use' && iterCount < MAX_ITERS) {
    iterCount++;
    const toolUseBlocks = data.content.filter((b) => b.type === 'tool_use');

    const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = [];
    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name!, block.input ?? {}, env);
      console.log(`[TOOL] ${block.name} result="${result.substring(0, 80)}"`);
      toolResults.push({ type: 'tool_result', tool_use_id: block.id!, content: result });
    }

    // Append assistant turn + tool results, then continue
    messages.push({ role: 'assistant', content: data.content as unknown as MessageContent });
    messages.push({ role: 'user', content: toolResults as unknown as MessageContent });

    await sendTypingAction(env, chatId);
    data = await callClaude(messages, env);
  }

  // Extract final text
  const textBlock = data.content.find((b) => b.type === 'text');
  const replyText = textBlock?.text?.trim() || 'לא הצלחתי לעבד את הבקשה.';

  console.log(`[REPLY] chat_id=${chatId} text="${replyText.substring(0, 120)}"`);

  // Save assistant reply and send to Telegram
  await saveMessage(chatId, 'assistant', replyText, env);
  await sendTelegramMessage(env, chatId, replyText);
}

async function callClaude(
  messages: Array<{ role: string; content: MessageContent }>,
  env: Env
): Promise<AnthropicResponse> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: CRM_TOOLS,
      messages
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('[CLAUDE] API error:', resp.status, err);
    throw new Error(`Claude API ${resp.status}: ${err}`);
  }

  return resp.json() as Promise<AnthropicResponse>;
}

// ---------------------------------------------------------------------------
// Daily summary cron (13:00 Israel = 11:00 UTC)
// ---------------------------------------------------------------------------

async function sendDailySummary(env: Env): Promise<void> {
  if (!env.OWNER_CHAT_ID) {
    console.warn('[CRON] OWNER_CHAT_ID not set, skipping daily summary');
    return;
  }

  const date = todayISO();
  const base = env.SUPABASE_URL;

  try {
    // Try dedicated summary table first
    const summaryUrl = `${base}/rest/v1/daily_summaries?date=eq.${date}&limit=1`;
    const summaries = await supabaseGet<Record<string, unknown>>(summaryUrl, env);

    let total = 0, answered = 0, missed = 0;

    if (summaries.length) {
      const s = summaries[0];
      total = (s.total_calls as number) ?? 0;
      answered = (s.answered_calls as number) ?? 0;
      missed = (s.missed_calls as number) ?? 0;
    } else {
      const callsUrl = `${base}/rest/v1/calls?date=eq.${date}`;
      const calls = await supabaseGet<Record<string, unknown>>(callsUrl, env);
      total = calls.length;
      missed = calls.filter((c) => c.status === 'missed').length;
      answered = calls.filter((c) => c.status === 'answered').length;
    }

    const summary =
      `📊 סיכום יומי — ${date}\n\n` +
      `📞 סה"כ שיחות: ${total}\n` +
      `✅ נענו: ${answered}\n` +
      `❌ לא נענו: ${missed}\n\n` +
      `שלח "כמה שיחות לא נענו היום?" לפרטים נוספים`;

    await sendTelegramMessage(env, env.OWNER_CHAT_ID, summary);
    console.log('[CRON] Daily summary sent');
  } catch (e) {
    console.error('[CRON] Daily summary failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/webhook') {
      let body: { message?: { text?: string; chat?: { id?: number | string } } };
      try {
        body = await request.json();
      } catch {
        return new Response('Bad Request', { status: 400 });
      }

      const text = body?.message?.text;
      const chatId = String(body?.message?.chat?.id ?? '');

      if (!text || !chatId) {
        return new Response('OK', { status: 200 });
      }

      // Use waitUntil so Telegram gets a fast 200 response while we process
      ctx.waitUntil(
        handleTelegramMessage(text, chatId, env).catch((e) =>
          console.error('[WEBHOOK] unhandled error:', e)
        )
      );

      return new Response('OK', { status: 200 });
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[CRON] triggered');
    ctx.waitUntil(sendDailySummary(env));
  }
};
