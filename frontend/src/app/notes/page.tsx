"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Plus, Search, X } from "lucide-react";
import {
	deleteNote,
	deleteTag,
	fetchNotes,
	fetchTags,
} from "@/app/notes/api";
import ConfirmDialog from "@/components/notes/ConfirmDialog";
import NoteCard from "@/components/notes/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import TagFilter from "@/components/notes/TagFilter";
import type { Note, Tag } from "@/components/notes/types";

const PAGE_SIZE = 12;

export default function NotesPage() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [activeTagId, setActiveTagId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [editorOpen, setEditorOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
	const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Debounce the search box so we don't fire a request per keystroke.
	useEffect(() => {
		const timer = setTimeout(() => setSearch(searchInput), 300);
		return () => clearTimeout(timer);
	}, [searchInput]);

	// A new search or tag filter starts back on page one.
	useEffect(() => {
		setPage(1);
	}, [search, activeTagId]);

	const loadNotes = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchNotes({ page, search, tag: activeTagId });
			setNotes(data.results);
			setTotalCount(data.count);
		} catch {
			setError("Couldn't load your notes. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [page, search, activeTagId]);

	useEffect(() => {
		loadNotes();
	}, [loadNotes]);

	const loadTags = useCallback(async () => {
		try {
			setTags(await fetchTags());
		} catch {
			// Tags are non-critical; the page still works without the filter row.
		}
	}, []);

	useEffect(() => {
		loadTags();
	}, [loadTags]);

	const openCreate = () => {
		setEditingNote(null);
		setEditorOpen(true);
	};

	const openEdit = (note: Note) => {
		setEditingNote(note);
		setEditorOpen(true);
	};

	const handleSaved = () => {
		setEditorOpen(false);
		setEditingNote(null);
		loadTags();
		loadNotes();
	};

	const handleDeleteNote = async () => {
		if (!noteToDelete) return;
		setDeleting(true);
		try {
			await deleteNote(noteToDelete.id);
			setNoteToDelete(null);
			// If the last note on a later page was removed, step back a page.
			if (notes.length === 1 && page > 1) {
				setPage(page - 1);
			} else {
				loadNotes();
			}
		} catch {
			setError("Couldn't delete the note. Please try again.");
		} finally {
			setDeleting(false);
		}
	};

	const handleDeleteTag = async () => {
		if (!tagToDelete) return;
		setDeleting(true);
		try {
			await deleteTag(tagToDelete.id);
			if (activeTagId === tagToDelete.id) setActiveTagId(null);
			setTagToDelete(null);
			loadTags();
			loadNotes();
		} catch {
			setError("Couldn't delete the tag. Please try again.");
		} finally {
			setDeleting(false);
		}
	};

	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
	const isFiltering = search.trim() !== "" || activeTagId !== null;

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Your notes</h1>
					<p className="mt-1 text-sm text-gray-600">
						{totalCount} {totalCount === 1 ? "note" : "notes"}
						{isFiltering && " (filtered)"}
					</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					<Plus size={16} /> New note
				</button>
			</div>

			<div className="space-y-3">
				<div className="relative">
					<label htmlFor="notes-search" className="sr-only">
						Search notes
					</label>
					<Search
						size={18}
						aria-hidden="true"
						className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<input
						id="notes-search"
						type="search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search by title or content…"
						className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-9 text-gray-900 placeholder-gray-400 focus-visible:outline-2 focus-visible:outline-indigo-600"
					/>
					{searchInput && (
						<button
							type="button"
							onClick={() => setSearchInput("")}
							aria-label="Clear search"
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
						>
							<X size={16} />
						</button>
					)}
				</div>

				{tags.length > 0 && (
					<TagFilter
						tags={tags}
						activeTagId={activeTagId}
						onSelect={setActiveTagId}
						onDeleteTag={setTagToDelete}
					/>
				)}
			</div>

			{error && (
				<div
					role="alert"
					className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					<span>{error}</span>
					<button
						type="button"
						onClick={loadNotes}
						className="shrink-0 font-medium underline focus-visible:outline-2 focus-visible:outline-red-600"
					>
						Retry
					</button>
				</div>
			)}

			{loading ? (
				<div
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
					aria-busy="true"
				>
					<span className="sr-only">Loading notes…</span>
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							aria-hidden="true"
							className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
						/>
					))}
				</div>
			) : notes.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
					<FileText size={40} aria-hidden="true" className="text-gray-300" />
					<h2 className="mt-4 text-lg font-medium text-gray-900">
						{isFiltering ? "No matching notes" : "No notes yet"}
					</h2>
					<p className="mt-1 max-w-sm text-sm text-gray-600">
						{isFiltering
							? "Try a different search term or clear the tag filter."
							: "Create your first note to get started."}
					</p>
					{!isFiltering && (
						<button
							type="button"
							onClick={openCreate}
							className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							<Plus size={16} /> Create a note
						</button>
					)}
				</div>
			) : (
				<>
					<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{notes.map((note) => (
							<li key={note.id}>
								<NoteCard
									note={note}
									onEdit={openEdit}
									onDelete={setNoteToDelete}
								/>
							</li>
						))}
					</ul>

					{totalPages > 1 && (
						<nav
							aria-label="Notes pagination"
							className="flex items-center justify-center gap-3"
						>
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
							>
								Previous
							</button>
							<span className="text-sm text-gray-600" aria-current="page">
								Page {page} of {totalPages}
							</span>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
								className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
							>
								Next
							</button>
						</nav>
					)}
				</>
			)}

			{editorOpen && (
				<NoteEditor
					note={editingNote}
					allTags={tags}
					onClose={() => {
						setEditorOpen(false);
						setEditingNote(null);
					}}
					onSaved={handleSaved}
				/>
			)}

			{noteToDelete && (
				<ConfirmDialog
					title="Delete note"
					message={`Delete "${noteToDelete.title}"? This can't be undone.`}
					busy={deleting}
					onConfirm={handleDeleteNote}
					onCancel={() => setNoteToDelete(null)}
				/>
			)}

			{tagToDelete && (
				<ConfirmDialog
					title="Delete tag"
					message={`Delete the tag "${tagToDelete.name}"? It will be removed from any notes that use it.`}
					busy={deleting}
					onConfirm={handleDeleteTag}
					onCancel={() => setTagToDelete(null)}
				/>
			)}
		</div>
	);
}
