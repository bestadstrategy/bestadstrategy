"use client";

import { useEffect, useRef, useState } from "react";

type TelegramAuthResult = {
	id_token?: string;
	error?: string;
};

const OIDC_ORIGIN = "https://oauth.telegram.org";

function openTelegramLogin(clientId: string, nonce: string): Promise<TelegramAuthResult> {
	const redirectUri = `${window.location.origin}${window.location.pathname}`;
	const authUrl = new URL("/auth", OIDC_ORIGIN);
	authUrl.searchParams.set("response_type", "post_message");
	authUrl.searchParams.set("client_id", clientId);
	authUrl.searchParams.set("redirect_uri", redirectUri);
	authUrl.searchParams.set("scope", "openid profile");
	authUrl.searchParams.set("nonce", nonce);
	authUrl.searchParams.set("lang", "en");
	authUrl.searchParams.set("origin", window.location.origin);

	const width = 550;
	const height = 650;
	const left = Math.max(0, (window.screen.width - width) / 2);
	const top = Math.max(0, (window.screen.height - height) / 2);
	const popup = window.open(
		authUrl.toString(),
		"telegram_oidc_login",
		`width=${width},height=${height},left=${left},top=${top},status=0,location=0,menubar=0,toolbar=0`,
	);

	return new Promise((resolve) => {
		if (!popup) {
			resolve({ error: "popup_blocked" });
			return;
		}

		let settled = false;
		const finish = (result: TelegramAuthResult) => {
			if (settled) return;
			settled = true;
			window.removeEventListener("message", onMessage);
			window.clearInterval(timer);
			resolve(result);
		};

		const onMessage = (event: MessageEvent) => {
			if (event.origin !== OIDC_ORIGIN) return;
			if (event.source !== popup) return;
			let data: { event?: string; result?: unknown; error?: string } | null = null;
			if (typeof event.data === "string") {
				try {
					data = JSON.parse(event.data) as { event?: string; result?: unknown; error?: string };
				} catch {
					return;
				}
			} else if (event.data && typeof event.data === "object") {
				data = event.data as { event?: string; result?: unknown; error?: string };
			}
			if (!data || data.event !== "auth_result") return;
			if (data.error) finish({ error: data.error });
			else if (typeof data.result === "string") finish({ id_token: data.result });
			else finish({ error: "missing id_token" });
		};

		const timer = window.setInterval(() => {
			if (popup.closed) finish({ error: "popup_closed" });
		}, 300);

		window.addEventListener("message", onMessage);
		popup.focus();
	});
}

export function TelegramLogin({ clientId }: { clientId: string }) {
	const nonceRef = useRef<string | null>(null);
	const [ready, setReady] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function prepare() {
			try {
				const response = await fetch("/api/auth/telegram/nonce");
				if (!response.ok) throw new Error("nonce");
				const data = (await response.json()) as { nonce?: string };
				if (!data.nonce) throw new Error("nonce");
				if (cancelled) return;
				nonceRef.current = data.nonce;
				setReady(true);
			} catch {
				if (!cancelled) setMessage("Telegram login could not be started.");
			}
		}

		void prepare();
		return () => {
			cancelled = true;
		};
	}, []);

	function login() {
		const nonce = nonceRef.current;
		if (!nonce) return;
		setMessage(null);
		void openTelegramLogin(clientId, nonce).then(async (result) => {
			if (result.error === "popup_closed") {
				setMessage("The Telegram window was closed before login finished.");
				return;
			}
			if (result.error === "popup_blocked") {
				setMessage("The browser blocked the Telegram window.");
				return;
			}
			if (!result.id_token) {
				setMessage("Telegram did not return a login.");
				return;
			}

			const response = await fetch("/api/auth/telegram", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id_token: result.id_token }),
			});
			if (!response.ok) {
				setMessage("Telegram could not confirm that login. Try again.");
				return;
			}
			window.location.assign("/");
		});
	}

	return (
		<div className="flex flex-col items-center gap-3">
			<button
				type="button"
				onClick={login}
				disabled={!ready}
				className="inline-flex h-11 items-center rounded-full bg-[#119AF5] px-7 text-4 font-semibold text-white disabled:opacity-60"
			>
				Log in with Telegram
			</button>
			{message ? <p className="text-3 text-gray-10 text-center">{message}</p> : null}
		</div>
	);
}
