import { create } from "zustand";
import type { MayaPresence, Message, PhotoReaction } from "@/entities";
import { playTyping } from "@/shared/sound";

interface ChatState {
	messages: Message[];
	isMayaTyping: boolean;
	mayaPresence: MayaPresence;
	/** Título del capítulo en curso (STORY.md §7, comando <<chapter>>). */
	chapterTitle: string | null;
	/** Disponibilidad de Maya (para el reloj de juego, comando <<availability>>). */
	mayaAvailability: string | null;
	appendMessage: (message: Message) => void;
	updateMessageStatus: (messageId: string, status: Message["status"]) => void;
	reactToMessage: (messageId: string, reaction: PhotoReaction) => void;
	markAllRead: () => void;
	setMayaTyping: (typing: boolean) => void;
	setMayaPresence: (presence: MayaPresence) => void;
	setChapterTitle: (title: string) => void;
	setMayaAvailability: (availability: string) => void;
}

function unreadIncoming(messages: Message[]): number {
	return messages.filter((m) => m.author === "maya" && m.status !== "read").length;
}

export const useChatStore = create<ChatState>((set) => ({
	messages: [],
	isMayaTyping: false,
	mayaPresence: "online",
	chapterTitle: null,
	mayaAvailability: null,

	appendMessage: (message) =>
		set((state) => {
			// Los mensajes entrantes llegan "entregados"; el jugador los lee
			// al abrir el chat (markAllRead).
			const incoming = message.author === "maya" && message.status === "read";
			const normalized = incoming ? { ...message, status: "delivered" as const } : message;
			return { messages: [...state.messages, normalized] };
		}),

	updateMessageStatus: (messageId, status) =>
		set((state) => ({
			messages: state.messages.map((message) =>
				message.id === messageId ? { ...message, status } : message,
			),
		})),

	reactToMessage: (messageId, reaction) =>
		set((state) => ({
			messages: state.messages.map((message) =>
				message.id === messageId ? { ...message, reaction } : message,
			),
		})),

	markAllRead: () =>
		set((state) => ({
			messages: state.messages.map((message) =>
				message.author === "maya" && message.status !== "read"
					? { ...message, status: "read" }
					: message,
			),
		})),

	setMayaTyping: (typing) =>
		set((state) => {
			if (typing && !state.isMayaTyping) playTyping();
			return { isMayaTyping: typing };
		}),
	setMayaPresence: (presence) => set({ mayaPresence: presence }),
	setChapterTitle: (title) => set({ chapterTitle: title }),
	setMayaAvailability: (availability) => set({ mayaAvailability: availability }),
}));

/** Cantidad de mensajes de Maya no leídos (para el badge y el contador). */
export function useUnreadCount(): number {
	return useChatStore((state) => unreadIncoming(state.messages));
}
