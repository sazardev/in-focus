import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChatStore } from "@/features/chat/store";
import { useGalleryStore } from "@/features/gallery/store";
import { useAbsenceStore } from "./store";

beforeEach(() => {
	vi.useFakeTimers();
	useChatStore.setState({ messages: [], isMayaTyping: false, mayaPresence: "online" });
	useGalleryStore.setState({ photos: [] });
	useAbsenceStore.setState({ absent: false, activeTimeout: null });
});

afterEach(() => {
	vi.useRealTimers();
});

describe("absence store", () => {
	it("pone a Maya como tomando fotos durante la ausencia", () => {
		useAbsenceStore.getState().beginAbsence({
			durationMs: 1000,
			burst: { texts: [], photos: [] },
		});
		expect(useAbsenceStore.getState().absent).toBe(true);
		expect(useChatStore.getState().mayaPresence).toBe("taking-photos");
	});

	it("al volver envía la ráfaga de mensajes y fotos", () => {
		useAbsenceStore.getState().beginAbsence({
			durationMs: 1000,
			burst: {
				texts: ["¡VOLVÍ!", "La luz estaba perfecta"],
				photos: ["atardecer"],
			},
		});
		vi.advanceTimersByTime(1000);
		vi.runAllTimers();

		expect(useAbsenceStore.getState().absent).toBe(false);
		expect(useChatStore.getState().mayaPresence).toBe("online");

		const messages = useChatStore.getState().messages;
		expect(messages.length).toBeGreaterThanOrEqual(3);
		expect(messages[0].content).toMatchObject({ kind: "text", text: "¡VOLVÍ!" });
		expect(messages.some((m) => m.content.kind === "photo")).toBe(true);
		expect(useGalleryStore.getState().photos.length).toBeGreaterThan(0);
	});

	it("cancelAbsence interrumpe la ausencia", () => {
		useAbsenceStore.getState().beginAbsence({
			durationMs: 5000,
			burst: { texts: [], photos: [] },
		});
		useAbsenceStore.getState().cancelAbsence();
		vi.advanceTimersByTime(10000);
		expect(useAbsenceStore.getState().absent).toBe(false);
		expect(useChatStore.getState().mayaPresence).toBe("online");
	});
});
