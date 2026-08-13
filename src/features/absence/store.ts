import { create } from "zustand";
import type { Message } from "@/entities";
import { useChatStore } from "@/features/chat/store";
import { resolvePhotoUrl } from "@/features/dialogue/photos";
import { calculateReadDelay } from "@/features/fake-typing/delay";
import { useGalleryStore } from "@/features/gallery/store";

interface AbsenceBurst {
	texts: string[];
	photos: string[];
}

interface AbsenceOptions {
	/** Duración de la ausencia en ms (en la demo se acelera el tiempo). */
	durationMs: number;
	burst: AbsenceBurst;
}

interface AbsenceState {
	absent: boolean;
	activeTimeout: ReturnType<typeof setTimeout> | null;
	beginAbsence: (options: AbsenceOptions) => void;
	cancelAbsence: () => void;
}

let msgSeq = 0;

function nextMessageId(): string {
	msgSeq += 1;
	return `absence-${msgSeq}`;
}

function asMessage(author: Message["author"], kind: "text" | "photo", value: string): Message {
	return {
		id: nextMessageId(),
		author,
		content: kind === "text" ? { kind: "text", text: value } : { kind: "photo", photoId: value },
		sentAt: Date.now(),
		status: "read",
	};
}

/**
 * Eventos de ausencia (SPEC §5): Maya "desaparece" durante un tiempo para
 * enfocarse en una sesión de fotos y, al volver, envía una ráfaga de
 * mensajes emocionados terminando con la foto final.
 */
export const useAbsenceStore = create<AbsenceState>((set) => ({
	absent: false,
	activeTimeout: null,

	beginAbsence: ({ durationMs, burst }) => {
		const state = useAbsenceStore.getState();
		if (state.activeTimeout) clearTimeout(state.activeTimeout);

		useChatStore.getState().setMayaPresence("taking-photos");
		set({ absent: true });

		const timeout = setTimeout(() => {
			useChatStore.getState().setMayaPresence("online");
			set({ absent: false, activeTimeout: null });

			const chat = useChatStore.getState();
			const gallery = useGalleryStore.getState();

			// Ráfaga de mensajes entrantes con delay simulado.
			const schedule = (delay: number) => (message: Message) => {
				setTimeout(() => {
					chat.appendMessage(message);
					if (message.content.kind === "photo") {
						const url = resolvePhotoUrl(message.content.photoId);
						if (url) {
							gallery.addPhoto({
								id: message.content.photoId,
								sourcePath: url,
								takenAt: Date.now(),
								unlocked: true,
							});
						}
					}
				}, delay);
			};

			let delay = 0;
			for (const text of burst.texts) {
				delay += calculateReadDelay(text.length);
				schedule(delay)(asMessage("maya", "text", text));
			}
			for (const photoId of burst.photos) {
				delay += 400;
				schedule(delay)(asMessage("maya", "photo", photoId));
			}
		}, durationMs);

		set({ activeTimeout: timeout });
	},

	cancelAbsence: () => {
		const { activeTimeout } = useAbsenceStore.getState();
		if (activeTimeout) clearTimeout(activeTimeout);
		useChatStore.getState().setMayaPresence("online");
		set({ absent: false, activeTimeout: null });
	},
}));
