import { create } from "zustand";

const NOTES_KEY = "in-focus:notes";

export interface Note {
	id: string;
	text: string;
	createdAt: number;
}

function loadNotes(): Note[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(NOTES_KEY);
		return raw ? (JSON.parse(raw) as Note[]) : [];
	} catch {
		return [];
	}
}

interface NotesState {
	notes: Note[];
	addNote: (text: string) => void;
	deleteNote: (id: string) => void;
	editNote: (id: string, text: string) => void;
}

let noteSeq = 0;

export const useNotesStore = create<NotesState>((set) => ({
	notes: loadNotes(),

	addNote: (text) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		noteSeq += 1;
		const note: Note = {
			id: `note-${Date.now()}-${noteSeq}`,
			text: trimmed.slice(0, 240),
			createdAt: Date.now(),
		};
		set((state) => {
			const notes = [note, ...state.notes];
			localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
			return { notes };
		});
	},

	deleteNote: (id) =>
		set((state) => {
			const notes = state.notes.filter((note) => note.id !== id);
			localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
			return { notes };
		}),

	editNote: (id, text) =>
		set((state) => {
			const trimmed = text.trim();
			if (!trimmed) return state;
			const notes = state.notes.map((note) =>
				note.id === id ? { ...note, text: trimmed.slice(0, 240) } : note,
			);
			localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
			return { notes };
		}),
}));
