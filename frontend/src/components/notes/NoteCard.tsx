"use client";

import { Globe, Pencil, Trash2 } from "lucide-react";
import type { Note } from "@/components/notes/types";

interface NoteCardProps {
	note: Note;
	onEdit: (note: Note) => void;
	onDelete: (note: Note) => void;
}

function formatDate(iso: string): string {
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(iso));
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
	return (
		<article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
			<div className="flex items-start justify-between gap-3">
				<h3 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
					{note.title}
				</h3>
				<div className="flex shrink-0 gap-1">
					<button
						type="button"
						onClick={() => onEdit(note)}
						aria-label={`Edit note ${note.title}`}
						className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
					>
						<Pencil size={16} />
					</button>
					<button
						type="button"
						onClick={() => onDelete(note)}
						aria-label={`Delete note ${note.title}`}
						className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600"
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>

			<p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-sm text-gray-600">
				{note.content}
			</p>

			{note.tags.length > 0 && (
				<ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
					{note.tags.map((tag) => (
						<li
							key={tag.id}
							className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
						>
							{tag.is_global && (
								<Globe size={11} aria-label="Global tag" className="text-indigo-500" />
							)}
							{tag.name}
						</li>
					))}
				</ul>
			)}

			<p className="mt-3 text-xs text-gray-500">
				Updated{" "}
				<time dateTime={note.updated_at}>{formatDate(note.updated_at)}</time>
			</p>
		</article>
	);
}
