import { useCallback, useEffect } from "react";
import { useChatStore } from "@/features/chat/store";
import { syncMessageSeq, useDialogueStore } from "@/features/dialogue";
import { useGalleryStore } from "@/features/gallery/store";
import { useProfileStore } from "@/features/profile/store";
import { useRelationshipStore } from "@/features/relationship";
import type { PersistedSaveState } from "./service";
import { deserializeMessage, persistenceService, serializeMessage } from "./service";

function buildState(): PersistedSaveState {
	const profile = useProfileStore.getState().profile;
	const relationship = useRelationshipStore.getState();
	const chat = useChatStore.getState();
	const dialogue = useDialogueStore.getState();
	const gallery = useGalleryStore.getState();

	return {
		profile: profile ? { name: profile.name, pronouns: profile.pronouns } : null,
		affinity: relationship.affinity,
		romance: relationship.romance,
		trust: relationship.trust,
		scriptVariables: dialogue.scriptVariables,
		choiceHistory: dialogue.choiceHistory,
		messages: chat.messages.map(serializeMessage),
		currentNode: dialogue.currentNode,
		chapterTitle: chat.chapterTitle,
		galleryPhotos: gallery.photos.map((p) => p.id),
	};
}

/**
 * Firma ligera del progreso real: ignora cambios de UI (tecleo, presencia,
 * disponibilidad) para no escribir a disco en cada toggle.
 */
function progressSignature(): string {
	const relationship = useRelationshipStore.getState();
	const chat = useChatStore.getState();
	const dialogue = useDialogueStore.getState();
	const gallery = useGalleryStore.getState();
	return [
		relationship.affinity,
		relationship.romance,
		relationship.trust,
		chat.messages.length,
		chat.chapterTitle ?? "",
		dialogue.currentNode,
		dialogue.choiceHistory.length,
		Object.keys(dialogue.scriptVariables).length,
		gallery.photos.length,
	].join("|");
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSignature = "";
let initialized = false;
let pending = false;

/** Guarda con debounce (500 ms) y solo si hubo progreso real. */
function scheduleSave(): void {
	const sig = progressSignature();
	if (!initialized) {
		lastSignature = sig;
		initialized = true;
		return;
	}
	if (sig === lastSignature) return;
	lastSignature = sig;
	pending = true;
	if (saveTimer) clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		saveTimer = null;
		pending = false;
		void persistenceService.save(buildState());
	}, 500);
}

/** Vacía el guardado pendiente (al ocultar la ventana o cerrar). */
function flushSave(): void {
	if (!pending) return;
	if (saveTimer) clearTimeout(saveTimer);
	saveTimer = null;
	pending = false;
	void persistenceService.save(buildState());
}

/**
 * Persistencia del progreso (STACK §2.2): hidrata los stores al montar y
 * guarda vía IPC de Rust (o localStorage) con debounce y solo cuando hay
 * progreso real (no por toggles de tecleo/presencia).
 */
export function usePersistence() {
	const hydrate = useCallback(async () => {
		const state = await persistenceService.load();
		if (!state) return;

		if (state.profile) {
			useProfileStore.getState().createProfile(state.profile);
		}
		useRelationshipStore.setState({
			affinity: state.affinity ?? 0,
			romance: state.romance ?? 0,
			trust: state.trust ?? 0,
		});
		useChatStore.setState({
			messages: state.messages.map(deserializeMessage),
			chapterTitle: state.chapterTitle ?? null,
		});
		useDialogueStore.setState({
			currentNode: state.currentNode,
			scriptVariables: state.scriptVariables ?? {},
			choiceHistory: state.choiceHistory ?? [],
		});
		// Restaura el contador de ids de mensaje para no duplicar claves React.
		syncMessageSeq(useChatStore.getState().messages);
		useGalleryStore.setState({
			photos: state.galleryPhotos.map((id) => ({
				id,
				sourcePath: id,
				takenAt: Date.now(),
				unlocked: true,
			})),
		});
	}, []);

	useEffect(() => {
		void hydrate();
	}, [hydrate]);

	useEffect(() => {
		const save = () => scheduleSave();
		const unsubscribeFns = [
			useProfileStore.subscribe(save),
			useRelationshipStore.subscribe(save),
			useChatStore.subscribe(save),
			useDialogueStore.subscribe(save),
			useGalleryStore.subscribe(save),
		];
		const flush = () => flushSave();
		window.addEventListener("beforeunload", flush);
		document.addEventListener("visibilitychange", flush);
		return () => {
			for (const unsubscribe of unsubscribeFns) {
				unsubscribe();
			}
			window.removeEventListener("beforeunload", flush);
			document.removeEventListener("visibilitychange", flush);
		};
	}, []);
}
