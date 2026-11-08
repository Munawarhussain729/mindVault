"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Loader2, Plus, X } from "lucide-react";
import { createNote, updateNote } from "@/app/notes/api";
import type { Note, Tag, TagInput } from "@/components/notes/types";

const TITLE_MAX_LENGTH = 200;

interface NoteEditorProps {
	note: Note | null;
	allTags: Tag[];
	onClose: () => void;
	onSaved: () => void;
}

interface FieldErrors {
	title?: string;
	content?: string;
	form?: string;
}

const inputClass =
	"w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus-visible:outline-2 focus-visible:outline-indigo-600";

export default function NoteEditor({
	note,
	allTags,
	onClose,
	onSaved,
}: NoteEditorProps) {
	const [title, setTitle] = useState(note?.title ?? "");
	const [content, setContent] = useState(note?.content ?? "");
	const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(
		() => new Set(note?.tags.map((t) => t.id) ?? []),
	);
	const [pendingTags, setPendingTags] = useState<string[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [errors, setErrors] = useState<FieldErrors>({});
	const [saving, setSaving] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		titleRef.current?.focus();
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	const toggleTag = (id: number) => {
		setSelectedTagIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const addPendingTag = () => {
		const name = newTagName.trim();
		if (!name) return;
		// If the name matches an existing tag, just select that tag instead.
		const existing = allTags.find(
			(t) => t.name.toLowerCase() === name.toLowerCase(),
		);
		if (existing) {
			setSelectedTagIds((prev) => new Set(prev).add(existing.id));
		} else if (!pendingTags.some((p) => p.toLowerCase() === name.toLowerCase())) {
			setPendingTags((prev) => [...prev, name]);
		}
		setNewTagName("");
	};

	const removePendingTag = (name: string) => {
		setPendingTags((prev) => prev.filter((p) => p !== name));
	};

	const validate = (): boolean => {
		const next: FieldErrors = {};
		if (!title.trim()) {
			next.title = "Title is required.";
		} else if (title.trim().length > TITLE_MAX_LENGTH) {
			next.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
		}
		if (!content.trim()) next.content = "Content is required.";
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving || !validate()) return;

		const tags: TagInput[] = [
			...[...selectedTagIds].map((id) => ({ id })),
			...pendingTags.map((name) => ({ name })),
		];
		setSaving(true);
		setErrors({});
		try {
			const payload = { title: title.trim(), content: content.trim(), tags };
			if (note) {
				await updateNote(note.id, payload);
			} else {
				await createNote(payload);
			}
			onSaved();
		} catch {
			setErrors({ form: "Could not save the note. Please try again." });
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="note-editor-title"
				className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
			>
				<div className="flex items-center justify-between">
					<h2 id="note-editor-title" className="text-lg font-semibold text-gray-900">
						{note ? "Edit note" : "New note"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close editor"
						className="rounded p-1.5 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
					>
						<X size={18} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
					{errors.form && (
						<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{errors.form}
						</p>
					)}

					<div>
						<label
							htmlFor="note-title"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Title
						</label>
						<input
							id="note-title"
							ref={titleRef}
							type="text"
							value={title}
							maxLength={TITLE_MAX_LENGTH}
							aria-invalid={!!errors.title}
							aria-describedby={errors.title ? "note-title-error" : undefined}
							onChange={(e) => {
								setTitle(e.target.value);
								if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
							}}
							className={inputClass}
							placeholder="e.g. Meeting notes"
						/>
						{errors.title && (
							<p id="note-title-error" className="mt-1 text-sm text-red-600">
								{errors.title}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="note-content"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Content
						</label>
						<textarea
							id="note-content"
							value={content}
							rows={7}
							aria-invalid={!!errors.content}
							aria-describedby={errors.content ? "note-content-error" : undefined}
							onChange={(e) => {
								setContent(e.target.value);
								if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
							}}
							className={`${inputClass} resize-y`}
							placeholder="Write it down…"
						/>
						{errors.content && (
							<p id="note-content-error" className="mt-1 text-sm text-red-600">
								{errors.content}
							</p>
						)}
					</div>

					<fieldset>
						<legend className="mb-1 text-sm font-medium text-gray-700">Tags</legend>
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => {
								const selected = selectedTagIds.has(tag.id);
								return (
									<button
										key={tag.id}
										type="button"
										aria-pressed={selected}
										onClick={() => toggleTag(tag.id)}
										className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${
											selected
												? "border-indigo-600 bg-indigo-600 text-white"
												: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
										}`}
									>
										{tag.is_global && <Globe size={12} aria-hidden="true" />}
										{tag.name}
									</button>
								);
							})}
							{pendingTags.map((name) => (
								<span
									key={name}
									className="inline-flex items-center gap-1 rounded-full border border-dashed border-indigo-400 bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
								>
									{name}
									<button
										type="button"
										onClick={() => removePendingTag(name)}
										aria-label={`Remove new tag ${name}`}
										className="rounded-full p-0.5 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
									>
										<X size={12} />
									</button>
								</span>
							))}
						</div>
						<div className="mt-2 flex gap-2">
							<label htmlFor="new-tag-name" className="sr-only">
								New tag name
							</label>
							<input
								id="new-tag-name"
								type="text"
								value={newTagName}
								maxLength={50}
								onChange={(e) => setNewTagName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addPendingTag();
									}
								}}
								className={`${inputClass} flex-1`}
								placeholder="Add a new tag"
							/>
							<button
								type="button"
								onClick={addPendingTag}
								disabled={!newTagName.trim()}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
							>
								<Plus size={16} /> Add
							</button>
						</div>
					</fieldset>

					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							disabled={saving}
							className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={saving}
							className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
						>
							{saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
							{saving ? "Saving…" : note ? "Save changes" : "Create note"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
