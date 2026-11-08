"use client";

import { Globe, X } from "lucide-react";
import type { Tag } from "@/components/notes/types";

interface TagFilterProps {
	tags: Tag[];
	activeTagId: number | null;
	onSelect: (tagId: number | null) => void;
	onDeleteTag: (tag: Tag) => void;
}

const chipBase =
	"inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600";

export default function TagFilter({
	tags,
	activeTagId,
	onSelect,
	onDeleteTag,
}: TagFilterProps) {
	return (
		<div
			className="flex gap-2 overflow-x-auto pb-1"
			role="group"
			aria-label="Filter notes by tag"
		>
			<button
				type="button"
				aria-pressed={activeTagId === null}
				onClick={() => onSelect(null)}
				className={`${chipBase} ${
					activeTagId === null
						? "border-indigo-600 bg-indigo-600 text-white"
						: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
				}`}
			>
				All
			</button>
			{tags.map((tag) => {
				const active = activeTagId === tag.id;
				return (
					<span
						key={tag.id}
						className={`${chipBase} ${
							active
								? "border-indigo-600 bg-indigo-600 text-white"
								: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
						}`}
					>
						<button
							type="button"
							aria-pressed={active}
							onClick={() => onSelect(active ? null : tag.id)}
							className="inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-indigo-600"
						>
							{tag.is_global && <Globe size={12} aria-hidden="true" />}
							{tag.name}
						</button>
						{!tag.is_global && (
							<button
								type="button"
								onClick={() => onDeleteTag(tag)}
								aria-label={`Delete tag ${tag.name}`}
								className={`rounded-full p-0.5 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
									active ? "hover:bg-indigo-500" : "hover:bg-gray-200"
								}`}
							>
								<X size={12} />
							</button>
						)}
					</span>
				);
			})}
		</div>
	);
}
