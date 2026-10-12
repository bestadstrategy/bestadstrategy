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

const PARTNERS_KEY = "bestadstrategy-jv-partners";
const SELECTED_KEY = "bestadstrategy-jv-selected";
const CHECKS_KEY = "bestadstrategy-jv-checks";

type Partner = { id: string; name: string };
type Checks = Record<string, Record<string, boolean>>;

function readJson<T>(key: string, fallback: T): T {
	try {
		const saved = localStorage.getItem(key);
		return saved ? (JSON.parse(saved) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function TaskChecklist() {
	const [partners, setPartners] = useState<Partner[]>([]);
	const [selectedId, setSelectedId] = useState("");
	const [checks, setChecks] = useState<Checks>({});
	const [adding, setAdding] = useState(false);
	const [name, setName] = useState("");
	const [notice, setNotice] = useState<string | null>(null);

	useEffect(() => {
		setPartners(readJson<Partner[]>(PARTNERS_KEY, []));
		setSelectedId(localStorage.getItem(SELECTED_KEY) ?? "");
		setChecks(readJson<Checks>(CHECKS_KEY, {}));
	}, []);

	function selectPartner(id: string) {
		setSelectedId(id);
		localStorage.setItem(SELECTED_KEY, id);
		setNotice(null);
	}

	function addPartner() {
		const trimmed = name.trim();
		if (!trimmed) return;
		const exists = partners.some(
			(partner) => partner.name.toLowerCase() === trimmed.toLowerCase(),
		);
		if (exists) {
			setNotice("That JV partner is already in the list.");
			return;
		}

		const partner = { id: crypto.randomUUID(), name: trimmed };
		const next = [...partners, partner];
		setPartners(next);
		localStorage.setItem(PARTNERS_KEY, JSON.stringify(next));
		selectPartner(partner.id);
		setName("");
		setAdding(false);
	}

	function toggle(taskId: string) {
		if (!selectedId) return;
		setChecks((current) => {
			const partnerChecks = current[selectedId] ?? {};
			const next = {
				...current,
				[selectedId]: { ...partnerChecks, [taskId]: !partnerChecks[taskId] },
			};
			localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
			return next;
		});
	}

	const partnerChecks = selectedId ? (checks[selectedId] ?? {}) : {};
	const finished = TASKS.filter((task) => partnerChecks[task.id]).length;
	const selected = partners.find((partner) => partner.id === selectedId);

	return (
		<div>
			<div className="flex items-center gap-2 mb-2">
				<label className="sr-only" htmlFor="jv-partner">
					JV partner
				</label>
				<select
					id="jv-partner"
					value={selected ? selectedId : ""}
					onChange={(event) => selectPartner(event.target.value)}
					className="min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-2xl font-bold"
				>
					<option value="">Select a JV partner</option>
					{partners.map((partner) => (
						<option key={partner.id} value={partner.id}>
							{partner.name}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={() => {
						setAdding((open) => !open);
						setNotice(null);
					}}
					aria-label="Add JV partner"
					className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#119AF5] text-2xl font-semibold text-white"
				>
					+
				</button>
			</div>

			{adding ? (
				<form
					className="mb-6 flex gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						addPartner();
					}}
				>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="JV partner name"
						aria-label="JV partner name"
						className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2"
					/>
					<button
						type="submit"
						className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
					>
						Add
					</button>
				</form>
			) : null}

			{notice ? <p className="mb-4 text-sm text-red-600">{notice}</p> : null}

			<p className="text-lg text-neutral-600 mb-8">Launch checklist</p>

			{selected ? (
				<div>
					<p className="text-sm text-neutral-500 mb-6">
						{finished} of {TASKS.length} done
					</p>
					<ul className="flex flex-col gap-2">
						{TASKS.map((task) => {
							const checked = Boolean(partnerChecks[task.id]);
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
			) : (
				<p className="text-neutral-600">Add a JV partner to start a checklist.</p>
			)}
		</div>
	);
}
