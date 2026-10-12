export function telegramBotConfig(): { clientId: string; secret: string } | null {
	const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
	const clientId = process.env.TELEGRAM_CLIENT_ID?.trim() || botToken?.split(":")[0] || "";
	const secret = process.env.TELEGRAM_CLIENT_SECRET?.trim() || botToken || "";
	if (!/^\d+$/.test(clientId) || !secret) return null;
	return { clientId, secret };
}
