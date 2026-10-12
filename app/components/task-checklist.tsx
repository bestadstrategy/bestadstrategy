"use client";

import { useEffect, useState } from "react";

const TASKS = [
	{ id: "clone-unifunnel", label: "Clone UniFunnel" },
	{ id: "show-20-minute", label: "Add Show in 20 minute code" },
	{ id: "test-google-analytics", label: "Test Google Analytics Shows Data" },
	{ id: "test-clarity", label: "Test Clarity Shows Data" },
	{ id: "test-facebook-pixel", label: "Test Facebook Pixel Shows Data" },
	{
		id: "test-firstpromoter",
		label: "Test Sale Through FirstPromoter Tracking (Coupon Code - Buy for $1)",
	},
] as const;

const STORAGE_KEY = "bestadstrategy-checklist";

export function TaskChecklist() {
	const [done, setDone] = useState<Record<string, boolean>>({});

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) setDone(JSON.parse(saved) as Record<string, boolean>);
		} catch {
			setDone({});
		}
	}, []);

	function toggle(id: string) {
		setDone((current) => {
			const next = { ...current, [id]: !current[id] };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		});
	}

	const finished = TASKS.filter((task) => done[task.id]).length;

	return (
		<div>
			<p className="text-sm text-neutral-500 mb-6">
				{finished} of {TASKS.length} done
			</p>
			<ul className="flex flex-col gap-2">
				{TASKS.map((task) => {
					const checked = Boolean(done[task.id]);
					return (
						<li key={task.id}>
							<label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 cursor-pointer">
								<input
									type="checkbox"
									checked={checked}
									onChange={() => toggle(task.id)}
									className="mt-1 h-5 w-5 shrink-0 accent-[#119AF5]"
								/>
								<span
									className={`text-base leading-6 ${checked ? "line-through text-neutral-400" : "text-neutral-900"}`}
								>
									{task.label}
								</span>
							</label>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
