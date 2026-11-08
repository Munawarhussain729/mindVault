import API from "@/app/lib/api";
import type { Note, NoteInput, Paginated, Tag } from "@/components/notes/types";

export interface NotesQuery {
	page?: number;
	search?: string;
	tag?: number | null;
}

export async function fetchNotes({
	page = 1,
	search = "",
	tag = null,
}: NotesQuery): Promise<Paginated<Note>> {
	const params: Record<string, string | number> = { page };
	if (search.trim()) params.search = search.trim();
	if (tag) params.tag = tag;
	const { data } = await API.get<Paginated<Note>>("/notes/", { params });
	return data;
}

export async function fetchTags(): Promise<Tag[]> {
	const { data } = await API.get<Tag[]>("/tags/");
	return data;
}

export async function createNote(input: NoteInput): Promise<Note> {
	const { data } = await API.post<Note>("/notes/", input);
	return data;
}

export async function updateNote(id: number, input: NoteInput): Promise<Note> {
	const { data } = await API.patch<Note>(`/notes/${id}/`, input);
	return data;
}

export async function deleteNote(id: number): Promise<void> {
	await API.delete(`/notes/${id}/`);
}

export async function deleteTag(id: number): Promise<void> {
	await API.delete(`/tags/${id}/`);
}
