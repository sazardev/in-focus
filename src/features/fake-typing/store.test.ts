import { describe, expect, it } from "vitest";
import { useFakeTypingStore } from "./store";

describe("fake typing store", () => {
	it("empieza en idle", () => {
		expect(useFakeTypingStore.getState().status).toBe("idle");
		expect(useFakeTypingStore.getState().isComplete).toBe(false);
	});

	it("inicia el typing con el texto objetivo", () => {
		useFakeTypingStore.getState().startTyping("Hola!");
		expect(useFakeTypingStore.getState().status).toBe("typing");
		expect(useFakeTypingStore.getState().targetText).toBe("Hola!");
		expect(useFakeTypingStore.getState().filledText).toBe("");
	});

	it("cada tecla avanza un carácter", () => {
		useFakeTypingStore.getState().startTyping("Hola");
		useFakeTypingStore.getState().pressKey();
		useFakeTypingStore.getState().pressKey();
		expect(useFakeTypingStore.getState().filledText).toBe("Ho");
		expect(useFakeTypingStore.getState().status).toBe("typing");
		expect(useFakeTypingStore.getState().isComplete).toBe(false);
	});

	it("al completar pasa a ready-to-send y devuelve true", () => {
		useFakeTypingStore.getState().startTyping("Sí");
		expect(useFakeTypingStore.getState().pressKey()).toBe(false);
		expect(useFakeTypingStore.getState().pressKey()).toBe(true);
		expect(useFakeTypingStore.getState().status).toBe("ready-to-send");
		expect(useFakeTypingStore.getState().isComplete).toBe(true);
		expect(useFakeTypingStore.getState().filledText).toBe("Sí");
	});

	it("ignora teclas fuera del estado typing", () => {
		useFakeTypingStore.getState().reset();
		expect(useFakeTypingStore.getState().pressKey()).toBe(false);
	});

	it("reset restaura el estado inicial", () => {
		useFakeTypingStore.getState().startTyping("X");
		useFakeTypingStore.getState().pressKey();
		useFakeTypingStore.getState().reset();
		expect(useFakeTypingStore.getState()).toMatchObject({
			status: "idle",
			targetText: "",
			filledText: "",
			isComplete: false,
		});
	});
});
