import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChatStore } from "@/features/chat/store";
import { useFakeTypingStore } from "@/features/fake-typing/store";
import { useGalleryStore } from "@/features/gallery/store";
import { useProfileStore } from "@/features/profile/store";
import { useRelationshipStore } from "@/features/relationship";
import { useDialogueStore } from "./store";

function advanceAllTimers(ms: number): void {
	vi.advanceTimersByTime(ms);
}

function completeTypingAndSend(): void {
	const typing = useFakeTypingStore.getState();
	const target = typing.targetText;
	for (let i = 0; i < target.length; i++) {
		typing.pressKey();
	}
	useDialogueStore.getState().confirmSend();
}

beforeEach(() => {
	vi.useFakeTimers();
	useDialogueStore.getState().reset();
	useRelationshipStore.getState().reset();
	useFakeTypingStore.getState().reset();
	useGalleryStore.getState().reset?.();
	useProfileStore.getState().createProfile({ name: "Alex", pronouns: "neutral" });
});

afterEach(() => {
	vi.useRealTimers();
	localStorage.clear();
	useProfileStore.setState({ profile: null });
});

describe("useDialogueStore (integración)", () => {
	it("inicia la conversación y muestra las primeras líneas de Maya", () => {
		useDialogueStore.getState().start();
		expect(useDialogueStore.getState().started).toBe(true);
		expect(useChatStore.getState().messages.length).toBe(0);
		expect(useChatStore.getState().isMayaTyping).toBe(true);

		advanceAllTimers(60_000);
		expect(useChatStore.getState().messages.length).toBeGreaterThan(0);
	});

	it("elegir opción inicia el teclado falso con el texto predefinido", () => {
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);

		const options = useDialogueStore.getState().options;
		expect(options?.length).toBeGreaterThanOrEqual(2);

		useDialogueStore.getState().chooseOption(0);
		expect(useDialogueStore.getState().options).toBeNull();
		expect(useDialogueStore.getState().pendingOption).not.toBeNull();
		expect(useFakeTypingStore.getState().status).toBe("typing");
		expect(useFakeTypingStore.getState().targetText).toBe(options?.[0].text);
	});

	it("el teclado falso llena el texto letra a letra y habilita enviar", () => {
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);
		useDialogueStore.getState().chooseOption(0);

		const target = useFakeTypingStore.getState().targetText;
		useFakeTypingStore.getState().pressKey();
		expect(useFakeTypingStore.getState().filledText).toBe(target.slice(0, 1));

		for (let i = 1; i < target.length; i++) {
			useFakeTypingStore.getState().pressKey();
		}
		expect(useFakeTypingStore.getState().isComplete).toBe(true);
		expect(useFakeTypingStore.getState().status).toBe("ready-to-send");
	});

	it("al confirmar el envío manda el mensaje del jugador y reacciona Maya", () => {
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);

		const messageCountBefore = useChatStore.getState().messages.length;
		useDialogueStore.getState().chooseOption(0);
		completeTypingAndSend();

		expect(useChatStore.getState().messages[messageCountBefore]).toMatchObject({
			author: "player",
		});
		expect(useDialogueStore.getState().pendingOption).toBeNull();
		expect(useFakeTypingStore.getState().status).toBe("idle");

		advanceAllTimers(60_000);
		expect(useChatStore.getState().messages.length).toBeGreaterThan(messageCountBefore + 1);
	});

	it("aplica los comandos de afinidad al estado global", () => {
		const initialAffinity = useRelationshipStore.getState().affinity;
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);
		useDialogueStore.getState().chooseOption(0);
		completeTypingAndSend();
		advanceAllTimers(60_000);

		expect(useRelationshipStore.getState().affinity).toBeGreaterThan(initialAffinity);
	});

	it("colecciona las fotos de Maya en la galería", () => {
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);

		// Recorre la historia hasta que aparezca al menos una foto.
		let guard = 0;
		while (useGalleryStore.getState().photos.length === 0 && guard < 80) {
			const options = useDialogueStore.getState().options;
			if (options) {
				useDialogueStore.getState().chooseOption(0);
				completeTypingAndSend();
			}
			advanceAllTimers(60_000);
			guard += 1;
		}

		expect(useGalleryStore.getState().photos.length).toBeGreaterThan(0);
	});

	it("termina la historia y marca finished", () => {
		useDialogueStore.getState().start();
		advanceAllTimers(60_000);

		let guard = 0;
		while (!useDialogueStore.getState().finished && guard < 300) {
			const options = useDialogueStore.getState().options;
			if (options) {
				useDialogueStore.getState().chooseOption(0);
				completeTypingAndSend();
			}
			advanceAllTimers(60_000);
			guard += 1;
		}

		expect(useDialogueStore.getState().finished).toBe(true);
	});
});
