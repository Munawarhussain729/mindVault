export interface Tag {
	id: number;
	name: string;
	label: string;
	is_global: boolean;
}

export interface Note {
	id: number;
	title: string;
	content: string;
	tags: Tag[];
	created_at: string;
	updated_at: string;
}

/** Tags sent on create/update: an id for an existing tag, a name to reuse or create. */
export type TagInput = { id: number } | { name: string };

export interface NoteInput {
	title: string;
	content: string;
	tags: TagInput[];
}

export interface Paginated<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}
