import { cookies } from "next/headers";
import { TelegramLogin } from "@/app/components/telegram-login";
import { telegramClientId } from "@/lib/telegram-oidc";
import { readSession, SESSION_COOKIE } from "@/lib/telegram-session";

export default async function Page() {
	const session = readSession((await cookies()).get(SESSION_COOKIE)?.value);
	const clientId = telegramClientId();

	return (
		<div className="py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto rounded-3xl bg-gray-a2 p-4 border border-gray-a4">
				<div className="text-center mt-8 mb-12">
					<h1 className="text-8 font-bold text-gray-12 mb-4">bestadstrategy</h1>
					<p className="text-4 text-gray-10">
						{session
							? "You are signed in with Telegram."
							: "Sign in with your Telegram account."}
					</p>
				</div>

				{session ? (
					<div className="flex flex-col items-center gap-4 mb-8">
						{session.photoUrl ? (
							<img
								src={session.photoUrl}
								alt=""
								className="h-16 w-16 rounded-full"
							/>
						) : null}
						<div className="text-center">
							<p className="text-5 font-semibold text-gray-12">{session.name}</p>
							{session.username ? (
								<p className="text-3 text-gray-10">@{session.username}</p>
							) : null}
						</div>
						<form action="/api/auth/logout" method="post">
							<button
								type="submit"
								className="inline-flex h-10 items-center rounded-full border border-gray-a6 px-5 text-3 font-medium text-gray-12"
							>
								Log out
							</button>
						</form>
					</div>
				) : (
					<div className="mb-8">
						{clientId ? (
							<TelegramLogin clientId={clientId} />
						) : (
							<p className="text-3 text-gray-10 text-center">
								Telegram login is not set up yet.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
