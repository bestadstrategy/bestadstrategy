import { createRemoteJWKSet, jwtVerify } from "jose";
import { telegramBotConfig } from "@/lib/telegram-config";
import type { TelegramSession } from "@/lib/telegram-session";

const JWKS = createRemoteJWKSet(
	new URL("https://oauth.telegram.org/.well-known/jwks.json"),
);

export function telegramClientId(): string | null {
	return telegramBotConfig()?.clientId ?? null;
}

export async function verifyTelegramIdToken(
	idToken: string,
	nonce: string,
): Promise<TelegramSession> {
	const clientId = telegramBotConfig()?.clientId;
	if (!clientId) {
		throw new Error("Telegram login is not configured.");
	}

	const { payload } = await jwtVerify(idToken, JWKS, {
		issuer: "https://oauth.telegram.org",
		audience: clientId,
		clockTolerance: 60,
	});

	if (payload.nonce !== nonce) {
		throw new Error("Telegram login nonce did not match.");
	}

	const rawId = payload.id ?? payload.sub;
	const id =
		typeof rawId === "number"
			? String(rawId)
			: typeof rawId === "string"
				? rawId
				: "";
	if (!/^\d+$/.test(id)) {
		throw new Error("Telegram login is missing a user id.");
	}

	const username =
		typeof payload.preferred_username === "string"
			? payload.preferred_username.replace(/^@/, "").slice(0, 64)
			: null;
	const given = typeof payload.given_name === "string" ? payload.given_name : "";
	const family = typeof payload.family_name === "string" ? payload.family_name : "";
	const combined = [given, family].filter(Boolean).join(" ");
	const name =
		(typeof payload.name === "string" && payload.name) ||
		combined ||
		username ||
		"Telegram user";
	const photoUrl =
		typeof payload.picture === "string" && payload.picture.startsWith("https://")
			? payload.picture
			: null;

	return {
		id,
		name: name.slice(0, 128),
		username,
		photoUrl,
	};
}
