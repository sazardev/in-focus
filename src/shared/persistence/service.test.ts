import { describe, expect, it } from "vitest";
import type { Message } from "@/entities";
import { deserializeMessage, persistenceService, serializeMessage } from "./service";

function makeMessage(overrides: Partial<Message> = {}): Message {
	return {
		id: "m1",
		author: "maya",
		content: { kind: "text", text: "Hola" },
		sentAt: 1000,
		status: "read",
		...overrides,
	};
}

describe("serialize/deserialize message", () => {
	it("serializa un mensaje de texto", () => {
		const stored = serializeMessage(makeMessage());
		expect(stored).toEqual({
			id: "m1",
			author: "maya",
			kind: "text",
			text: "Hola",
			sentAt: 1000,
		});
	});

	it("serializa un mensaje de foto guardando el photoId en text", () => {
		const stored = serializeMessage(
			makeMessage({ content: { kind: "photo", photoId: "atardecer" } }),
		);
		expect(stored.kind).toBe("photo");
		expect(stored.text).toBe("atardecer");
	});

	it("reconstruye un mensaje persistido", () => {
		const message = deserializeMessage({
			id: "m2",
			author: "player",
			kind: "text",
			text: "Buenos días",
			sentAt: 2000,
		});
		expect(message.content).toEqual({ kind: "text", text: "Buenos días" });
		expect(message.status).toBe("read");
	});
});

describe("persistenceService", () => {
	it("guarda y carga con fallback a localStorage fuera de Tauri", async () => {
		localStorage.clear();
		const state = {
			profile: { name: "Alex", pronouns: "neutral" as const },
			affinity: 10,
			romance: 30,
			trust: 20,
			scriptVariables: { cap_01_done: true, mejores_fotos: 2 },
			choiceHistory: [0, 1, 0],
			messages: [serializeMessage(makeMessage())],
			currentNode: "Cap2_Intro",
			chapterTitle: "Capítulo 2 — 36 fotos",
			galleryPhotos: ["atardecer"],
		};

		await persistenceService.save(state);
		const loaded = await persistenceService.load();
		expect(loaded).toEqual(state);
	});

	it("load devuelve null si no hay estado guardado", async () => {
		localStorage.clear();
		expect(await persistenceService.load()).toBeNull();
	});
});
