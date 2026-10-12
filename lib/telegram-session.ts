import { createHmac, timingSafeEqual } from "node:crypto";
import { telegramBotConfig } from "@/lib/telegram-config";

export const SESSION_COOKIE = "bas_telegram";
export const NONCE_COOKIE = "bas_telegram_nonce";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type TelegramSession = {
	id: string;
	name: string;
	username: string | null;
	photoUrl: string | null;
};

function sessionSecret(): string | null {
	return telegramBotConfig()?.secret ?? null;
}

export function signSession(user: TelegramSession): string | null {
	const secret = sessionSecret();
	if (!secret) return null;

	const body = Buffer.from(
		JSON.stringify({
			...user,
			exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
		}),
	).toString("base64url");
	const signature = createHmac("sha256", secret).update(body).digest("base64url");
	return `${body}.${signature}`;
}

export function readSession(token: string | undefined): TelegramSession | null {
	const secret = sessionSecret();
	if (!secret || !token) return null;

	const dot = token.lastIndexOf(".");
	if (dot <= 0) return null;

	const body = token.slice(0, dot);
	const signature = token.slice(dot + 1);
	const expected = createHmac("sha256", secret).update(body).digest("base64url");
	const actualBuffer = Buffer.from(signature);
	const expectedBuffer = Buffer.from(expected);
	if (actualBuffer.length !== expectedBuffer.length) return null;
	if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

	try {
		const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
			id?: unknown;
			name?: unknown;
			username?: unknown;
			photoUrl?: unknown;
			exp?: unknown;
		};
		if (typeof parsed.exp !== "number" || parsed.exp < Date.now() / 1000) return null;
		if (typeof parsed.id !== "string" || !/^\d+$/.test(parsed.id)) return null;
		if (typeof parsed.name !== "string" || parsed.name.length === 0) return null;

		return {
			id: parsed.id,
			name: parsed.name,
			username: typeof parsed.username === "string" ? parsed.username : null,
			photoUrl:
				typeof parsed.photoUrl === "string" && parsed.photoUrl.startsWith("https://")
					? parsed.photoUrl
					: null,
		};
	} catch {
		return null;
	}
}

export function sessionCookieOptions() {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
		maxAge: SESSION_TTL_SECONDS,
	};
}
