const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramNotification(
  name: string,
  phone: string | undefined,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("Telegram not configured — skipping notification");
    return false;
  }

  const text = `
📩 <b>New Contact Message</b>

<b>Name:</b> ${name}
<b>Phone:</b> ${phone || "N/A"}
<b>Email:</b> ${email}
<b>Subject:</b> ${subject}

<b>Message:</b>
${message}
  `.trim();

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Telegram sendMessage failed:", errBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram notification error:", error);
    return false;
  }
}
