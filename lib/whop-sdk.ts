import { Whop } from "@whop/sdk";

let client: Whop | undefined;

export function getWhopSdk() {
	if (!client) {
		client = new Whop({
			appID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
			apiKey: process.env.WHOP_API_KEY,
			webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
		});
	}
	return client;
}
