// /api/submit — Vercel serverless function
// Receives Loreni's answers from the browser and forwards them to your
// Telegram account using a bot token that is NEVER exposed to the frontend.
//
// Required environment variables (set in Vercel → Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  — the token BotFather gave you
//   TELEGRAM_CHAT_ID    — your personal Telegram chat id

const MAX_FIELD_LEN = 500;
const MAX_LIST_ITEMS = 25;

function clean(value, maxLen = MAX_FIELD_LEN) {
  if (value === null || value === undefined) return "";
  const str = String(value).slice(0, maxLen);
  // Escape Telegram HTML parse-mode special characters
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cleanList(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_LIST_ITEMS).map((v) => clean(v, 120));
}

function buildMessage(data) {
  const lines = [];
  lines.push("🐈❤️ <b>LORENI FINISHED THE LOVE LETTER</b> ❤️🐈");
  lines.push("");
  lines.push(`<b>Nickname:</b>\n${clean(data.nickname) || "—"}`);
  lines.push("");
  lines.push(`<b>Favorite color:</b>\n${clean(data.favoriteColor) || "—"}`);
  lines.push("");
  lines.push(`<b>Favorite food:</b>\n${clean(data.favoriteFood) || "—"}`);
  lines.push("");
  lines.push(`<b>Favorite song/artist:</b>\n${clean(data.favoriteSong) || "—"}`);
  lines.push("");
  lines.push(`<b>Things she loves:</b>\n${cleanList(data.loves).join(", ") || "—"}`);
  lines.push("");
  lines.push(`<b>Things she dislikes:</b>\n${clean(data.dislikes) || "—"}`);
  lines.push("");
  lines.push(`<b>Birthday:</b>\n${clean(data.birthDate) || "—"}`);
  lines.push("");
  lines.push(`<b>Age:</b>\n${clean(data.age)}`);
  lines.push("");
  lines.push(`<b>Favorite memory:</b>\n${clean(data.memory, 800) || "—"}`);

  if (data.choices && typeof data.choices === "object") {
    lines.push("");
    lines.push("<b>Choices:</b>");
    const c = data.choices;
    lines.push(`• Dream date: ${clean(c.dateChoice) || "—"}`);
    lines.push(`• Who loves more: ${clean(c.whoLovesMore) || "—"}`);
    lines.push(`• Do you love me: ${clean(c.doYouLoveMe) || "—"}`);
    lines.push(`• "No" attempts before yes: ${clean(c.noAttempts)}`);
    lines.push(`• Stay with me: ${clean(c.stayWithMe) || "—"}`);
    lines.push(`• Cat pets: ${clean(c.petTaps)}`);
    lines.push(`• Final answer: ${clean(c.finalAnswer) || "—"}`);
  }

  lines.push("");
  lines.push("💌 She reached the end.");
  return lines.join("\n");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    res.status(500).json({ ok: false, error: "Server not configured" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== "object") body = {};

  // Basic shape validation — every field is optional/best-effort so a
  // partially-filled run still reaches you.
  const payload = {
    nickname: body.nickname,
    favoriteColor: body.favoriteColor,
    favoriteFood: body.favoriteFood,
    favoriteSong: body.favoriteSong,
    loves: body.loves,
    dislikes: body.dislikes,
    birthDate: body.birthDate,
    age: body.age,
    memory: body.memory,
    choices: body.choices,
  };

  const text = buildMessage(payload);

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgRes.json().catch(() => ({}));

    if (!tgRes.ok || tgData.ok === false) {
      console.error("Telegram API error:", tgData);
      res.status(502).json({ ok: false, error: "Telegram delivery failed" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
    res.status(500).json({ ok: false, error: "Unexpected server error" });
  }
};
