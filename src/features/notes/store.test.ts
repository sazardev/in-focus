import { beforeEach, describe, expect, it } from "vitest";
import { useNotesStore } from "./store";

describe("notes store", () => {
	beforeEach(() => {
		localStorage.clear();
		useNotesStore.setState({ notes: [] });
	});

	it("añade notas y las persiste", () => {
		useNotesStore.getState().addNote("  Primer recuerdo  ");
		expect(useNotesStore.getState().notes).toHaveLength(1);
		expect(useNotesStore.getState().notes[0].text).toBe("Primer recuerdo");
		expect(localStorage.getItem("in-focus:notes")).toContain("Primer recuerdo");
	});

	it("ignora notas vacías", () => {
		useNotesStore.getState().addNote("   ");
		expect(useNotesStore.getState().notes).toHaveLength(0);
	});

	it("borra una nota", () => {
		useNotesStore.getState().addNote("Una");
		useNotesStore.getState().addNote("Dos");
		const first = useNotesStore.getState().notes[0];
		expect(first.text).toBe("Dos");
		useNotesStore.getState().deleteNote(first.id);
		expect(useNotesStore.getState().notes).toHaveLength(1);
		expect(useNotesStore.getState().notes[0].text).toBe("Una");
	});

	it("edita una nota", () => {
		useNotesStore.getState().addNote("Original");
		const note = useNotesStore.getState().notes[0];
		useNotesStore.getState().editNote(note.id, "Editada");
		expect(useNotesStore.getState().notes[0].text).toBe("Editada");
		expect(localStorage.getItem("in-focus:notes")).toContain("Editada");
	});
});
