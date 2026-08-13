import { invoke, isTauri } from "@tauri-apps/api/core";
import type { Message, PhotoReaction, Pronouns } from "@/entities";

/** Payload compatible con el modelo Rust `SaveState`. */
export interface PersistedSaveState {
	profile: { name: string; pronouns: Pronouns } | null;
	affinity: number;
	romance: number;
	trust: number;
	/** Variables del script Yarn (flags de capítulo, contadores, etc.). */
	scriptVariables: Record<string, unknown>;
	/** Índices de opciones elegidas en orden (para resume determinista). */
	choiceHistory: number[];
	messages: {
		id: string;
		author: "player" | "maya";
		kind: "text" | "photo";
		text: string;
		sentAt: number;
	}[];
	currentNode: string;
	chapterTitle: string | null;
	galleryPhotos: string[];
}

const LOCAL_KEY = "in-focus:save-state";

export function isTauriRuntime(): boolean {
	try {
		return isTauri();
	} catch {
		return false;
	}
}

/**
 * Servicio de guardado (STACK §2.2): escribe el progreso del jugador a través
 * de los comandos IPC de Rust cuando corre dentro de Tauri; en navegador/dev
 * usa localStorage como respaldo.
 */
export const persistenceService = {
	async save(state: PersistedSaveState): Promise<void> {
		if (isTauriRuntime()) {
			await invoke("save_state", { state });
			return;
		}
		localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
	},

	async load(): Promise<PersistedSaveState | null> {
		if (isTauriRuntime()) {
			const state = await invoke<PersistedSaveState | null>("load_state");
			return state ?? null;
		}
		const raw = localStorage.getItem(LOCAL_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as PersistedSaveState;
		} catch {
			return null;
		}
	},
};

/** Convierte un mensaje del chat al formato persistible. */
export function serializeMessage(message: Message): PersistedSaveState["messages"][number] {
	return {
		id: message.id,
		author: message.author,
		kind: message.content.kind,
		text: message.content.kind === "text" ? message.content.text : message.content.photoId,
		sentAt: message.sentAt,
	};
}

/** Reconstruye un mensaje persistido. */
export function deserializeMessage(stored: PersistedSaveState["messages"][number]): Message {
	return {
		id: stored.id,
		author: stored.author,
		content:
			stored.kind === "text"
				? { kind: "text", text: stored.text }
				: { kind: "photo", photoId: stored.text },
		sentAt: stored.sentAt,
		status: "read",
		reaction: null as PhotoReaction | null,
	};
}
