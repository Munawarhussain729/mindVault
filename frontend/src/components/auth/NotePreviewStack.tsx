import { Globe } from "lucide-react";

const sample = [
	{
		title: "Reading list",
		body: "Designing Data-Intensive Applications, The Pragmatic Programmer.",
		tags: ["Books"],
		className: "translate-x-10 -rotate-2",
	},
	{
		title: "Study plan",
		body: "Algorithms on Monday and Wednesday, revision on the weekend.",
		tags: ["Algorithms", "Revision"],
		className: "-translate-x-2 rotate-1",
	},
	{
		title: "Project ideas",
		body: "A habit tracker, a recipe organiser, a tiny Markdown blog.",
		tags: ["Projects", "Ideas"],
		className: "translate-x-6 -rotate-1",
	},
];

/** Decorative preview of what a notebook looks like. Hidden from assistive tech. */
export default function NotePreviewStack() {
	return (
		<div aria-hidden="true" className="flex w-full max-w-sm flex-col gap-4">
			{sample.map((note) => (
				<article
					key={note.title}
					className={`rounded-xl border border-white/10 bg-white p-5 shadow-lg shadow-black/20 ${note.className}`}
				>
					<h3 className="text-base font-semibold text-gray-900">{note.title}</h3>
					<p className="mt-1.5 text-sm leading-relaxed text-gray-600">{note.body}</p>
					<div className="mt-3 flex flex-wrap gap-1.5">
						{note.tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
							>
								<Globe size={11} />
								{tag}
							</span>
						))}
					</div>
				</article>
			))}
		</div>
	);
}
