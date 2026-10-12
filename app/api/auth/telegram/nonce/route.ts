import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { NONCE_COOKIE } from "@/lib/telegram-session";

export async function GET() {
	const nonce = randomBytes(16).toString("base64url");
	const response = NextResponse.json({ nonce });
	response.cookies.set(NONCE_COOKIE, nonce, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 10,
	});
	return response;
}
