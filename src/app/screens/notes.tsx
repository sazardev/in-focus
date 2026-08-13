import { useState } from "react";
import { useDialogueStore } from "@/features/dialogue";
import { DIARY } from "@/features/diary/data";
import { DiaryEntryCard } from "@/features/diary/diary-entry-card";
import { QUOTES } from "@/features/diary/quotes";
import { useNotesStore } from "@/features/notes/store";
import { useToastStore } from "@/shared/toast/store";
import { AppScreen } from "./app-screen";

type NotesView = "diary" | "quotes" | "notes";

function isDiaryUnlocked(
	chapter: number,
	currentChapter: number,
	scriptVariables: Record<string, unknown>,
): boolean {
	if (chapter === 1) return true;
	if (chapter === currentChapter) return true;
	return scriptVariables[`cap_${String(chapter).padStart(2, "0")}_done`] === true;
}

export function NotesScreen() {
	const notes = useNotesStore((state) => state.notes);
	const addNote = useNotesStore((state) => state.addNote);
	const deleteNote = useNotesStore((state) => state.deleteNote);
	const editNote = useNotesStore((state) => state.editNote);
	const scriptVariables = useDialogueStore((state) => state.scriptVariables);
	const currentNode = useDialogueStore((state) => state.currentNode);
	const choiceLog = useDialogueStore((state) => state.choiceLog);
	const currentChapter = Number(/^Cap(\d+)/.exec(currentNode)?.[1]) ?? 0;
	const [view, setView] = useState<NotesView>("diary");
	const [draft, setDraft] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState("");

	function submit() {
		addNote(draft);
		if (draft.trim()) useToastStore.getState().push("Nota añadida");
		setDraft("");
	}

	function startEdit(id: string, text: string) {
		setEditingId(id);
		setEditingText(text);
	}

	function saveEdit() {
		if (editingId) editNote(editingId, editingText);
		useToastStore.getState().push("Nota actualizada");
		setEditingId(null);
		setEditingText("");
	}

	return (
		<AppScreen title="Notas">
			<div className="notes">
				<div className="notes__tabs" role="tablist" aria-label="Vistas de notas">
					<button
						type="button"
						className={`notes__tab ${view === "diary" ? "notes__tab--active" : ""}`}
						role="tab"
						aria-selected={view === "diary"}
						onClick={() => setView("diary")}
					>
						Diario
					</button>
					<button
						type="button"
						className={`notes__tab ${view === "quotes" ? "notes__tab--active" : ""}`}
						role="tab"
						aria-selected={view === "quotes"}
						onClick={() => setView("quotes")}
					>
						Frases
					</button>
					<button
						type="button"
						className={`notes__tab ${view === "notes" ? "notes__tab--active" : ""}`}
						role="tab"
						aria-selected={view === "notes"}
						onClick={() => setView("notes")}
					>
						Notas
					</button>
				</div>

				{view === "quotes" ? (
					<div className="diary">
						<p className="diary__hint">
							Las frases de Maya se desbloquean a medida que avanza la historia.
						</p>
						<ul className="diary__list">
							{QUOTES.map((entry) => {
								const unlocked = isDiaryUnlocked(entry.chapter, currentChapter, scriptVariables);
								return (
									<li
										key={entry.chapter}
										className={`diary__entry ${unlocked ? "" : "diary__entry--locked"}`}
									>
										<span className="diary__chapter">
											Cap. {String(entry.chapter).padStart(2, "0")}
										</span>
										{unlocked ? (
											<span className="diary__text">“{entry.quote}”</span>
										) : (
											<span className="diary__locked">Bloqueado</span>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				) : view === "diary" ? (
					<div className="diary">
						<p className="diary__hint">
							El diario del protagonista: cada capítulo desbloquea una entrada completa.
						</p>
						<ul className="diary__list">
							{DIARY.map((entry) => {
								const unlocked = isDiaryUnlocked(entry.chapter, currentChapter, scriptVariables);
								const choices = choiceLog.filter((choice) => choice.chapter === entry.chapter);
								return (
									<li
										key={entry.chapter}
										className={`diary__entry ${unlocked ? "" : "diary__entry--locked"}`}
									>
										<span className="diary__chapter">
											Cap. {String(entry.chapter).padStart(2, "0")}
										</span>
										<span className="diary__title">{entry.title}</span>
										{unlocked ? (
											<DiaryEntryCard entry={entry} unlocked choices={choices} />
										) : (
											<span className="diary__locked">Bloqueado</span>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				) : (
					<>
						<div className="notes__composer">
							<input
								className="notes__input"
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") submit();
								}}
								placeholder="Escribe una nota…"
								aria-label="Nueva nota"
							/>
							<button type="button" className="btn btn--primary" onClick={submit}>
								Añadir
							</button>
						</div>

						{notes.length === 0 ? (
							<p className="notes__empty">
								Aún no hay notas. Guarda una frase, un recuerdo o un pensamiento.
							</p>
						) : (
							<ul className="notes__list">
								{notes.map((note) =>
									editingId === note.id ? (
										<li key={note.id} className="note">
											<input
												className="notes__input"
												value={editingText}
												onChange={(event) => setEditingText(event.target.value)}
												onKeyDown={(event) => {
													if (event.key === "Enter") saveEdit();
													if (event.key === "Escape") setEditingId(null);
												}}
												onBlur={saveEdit}
												aria-label="Editar nota"
											/>
											<button type="button" className="btn btn--primary" onClick={saveEdit}>
												Guardar
											</button>
										</li>
									) : (
										<li key={note.id} className="note">
											<span className="note__text">{note.text}</span>
											<button
												type="button"
												className="note__edit"
												aria-label="Editar nota"
												onClick={() => startEdit(note.id, note.text)}
											>
												✎
											</button>
											<button
												type="button"
												className="note__delete"
												aria-label="Borrar nota"
												onClick={() => {
													deleteNote(note.id);
													useToastStore.getState().push("Nota borrada");
												}}
											>
												✕
											</button>
										</li>
									),
								)}
							</ul>
						)}
					</>
				)}
			</div>
		</AppScreen>
	);
}
