import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyTelegramIdToken } from "@/lib/telegram-oidc";
import {
	NONCE_COOKIE,
	SESSION_COOKIE,
	sessionCookieOptions,
	signSession,
} from "@/lib/telegram-session";

export async function POST(request: Request) {
	let idToken = "";
	try {
		const body = (await request.json()) as { id_token?: unknown };
		if (typeof body.id_token === "string") idToken = body.id_token;
	} catch {
		return NextResponse.json({ error: "Missing Telegram login token." }, { status: 400 });
	}

	if (!idToken) {
		return NextResponse.json({ error: "Missing Telegram login token." }, { status: 400 });
	}

	const cookieStore = await cookies();
	const nonce = cookieStore.get(NONCE_COOKIE)?.value;
	if (!nonce) {
		return NextResponse.json({ error: "Telegram login expired. Try again." }, { status: 401 });
	}

	try {
		const user = await verifyTelegramIdToken(idToken, nonce);
		const session = signSession(user);
		if (!session) {
			return NextResponse.json(
				{ error: "Telegram login is not configured." },
				{ status: 503 },
			);
		}

		const response = NextResponse.json({ ok: true });
		response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions());
		response.cookies.set(NONCE_COOKIE, "", { path: "/", maxAge: 0 });
		return response;
	} catch {
		return NextResponse.json(
			{ error: "Telegram could not confirm that login." },
			{ status: 401 },
		);
	}
}
