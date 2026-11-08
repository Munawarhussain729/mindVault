import NotePreviewStack from "@/components/auth/NotePreviewStack";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] md:grid md:grid-cols-[5fr_7fr]">
			<aside className="hidden flex-col justify-between bg-[#17143a] p-12 text-white md:flex">
				<div className="text-xl font-semibold tracking-tight">🧠 MindVault</div>
				<div className="space-y-10">
					<p className="max-w-sm text-balance text-3xl font-semibold leading-tight tracking-tight">
						Write it down. Find it later.
					</p>
					<NotePreviewStack />
				</div>
				<p className="text-sm text-indigo-200/80">Your notes and tags stay private to your account.</p>
			</aside>
			<main className="flex min-h-screen flex-col px-4 py-6 sm:px-8 md:min-h-0 md:justify-center md:px-16">
				<div className="mb-10 text-lg font-semibold tracking-tight text-gray-900 md:hidden">
					🧠 MindVault
				</div>
				<div className="my-auto w-full max-w-sm md:my-0">{children}</div>
			</main>
		</div>
	);
}
