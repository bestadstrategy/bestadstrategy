import { TaskChecklist } from "@/app/components/task-checklist";

export default function Page() {
	return (
		<div className="min-h-screen bg-[#f4f5f7] px-4 py-12 text-[#111]">
			<div className="max-w-2xl mx-auto rounded-3xl bg-white p-6 border border-black/10 shadow-sm">
				<h1 className="text-3xl font-bold mb-2">bestadstrategy</h1>
				<p className="text-lg text-neutral-600 mb-8">Launch checklist</p>
				<TaskChecklist />
			</div>
		</div>
	);
}
