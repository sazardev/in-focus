import { create } from "zustand";

export type FakeTypingStatus = "idle" | "typing" | "ready-to-send";

interface FakeTypingState {
	status: FakeTypingStatus;
	targetText: string;
	filledText: string;
	isComplete: boolean;
	startTyping: (targetText: string) => void;
	pressKey: () => boolean;
	reset: () => void;
}

export const useFakeTypingStore = create<FakeTypingState>((set, get) => ({
	status: "idle",
	targetText: "",
	filledText: "",
	isComplete: false,

	startTyping: (targetText) =>
		set({ status: "typing", targetText, filledText: "", isComplete: targetText.length === 0 }),

	/**
	 * El jugador presiona cualquier tecla (física o del teclado virtual):
	 * avanza un carácter del texto predefinido. Devuelve true cuando el
	 * texto quedó completo y el botón de enviar debe iluminarse.
	 */
	pressKey: () => {
		const { filledText, targetText, status } = get();
		if (status !== "typing") return get().isComplete;

		const nextLength = filledText.length + 1;
		const complete = nextLength >= targetText.length;
		set({
			filledText: targetText.slice(0, nextLength),
			isComplete: complete,
			status: complete ? "ready-to-send" : "typing",
		});
		return complete;
	},

	reset: () => set({ status: "idle", targetText: "", filledText: "", isComplete: false }),
}));
