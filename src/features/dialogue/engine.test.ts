import { describe, expect, it } from "vitest";
import { DialogueEngine } from "./engine";
import type { DialogueEffects } from "./types";

const SCRIPT = `
title: Start
---
<<declare $affinity = 0>>
Maya: Hola!
-> Saludar
    <<affinity +5>>
    Maya: Qué amable!
-> Saludar frio
    <<affinity -3>>
    Maya: Uy...
<<presence taking-photos>>
<<photo atardecer>>
Maya: Adiós
===
`;

function createEngine(effects: Partial<DialogueEffects> = {}) {
	return new DialogueEngine({
		script: SCRIPT,
		effects: {
			affinity: () => {},
			romance: () => {},
			trust: () => {},
			presence: () => {},
			typing: () => {},
			photo: () => {},
			notify: () => {},
			chapter: () => {},
			availability: () => {},
			absence: () => {},
			end: () => {},
			...effects,
		},
	});
}

describe("DialogueEngine", () => {
	it("salta comandos y devuelve la primera línea de Maya", () => {
		const engine = createEngine();
		expect(engine.current).toMatchObject({
			kind: "line",
			speaker: "Maya",
			text: "Hola!",
		});
	});

	it("avanza desde una línea y presenta opciones", () => {
		const engine = createEngine();
		engine.advance();
		expect(engine.current.kind).toBe("options");
		if (engine.current.kind === "options") {
			expect(engine.current.options.map((o) => o.text)).toEqual(["Saludar", "Saludar frio"]);
		}
	});

	it("aplica efectos de los comandos al elegir una opción", () => {
		const applied: string[] = [];
		const engine = createEngine({
			affinity: (delta) => applied.push(`affinity:${delta}`),
		});
		engine.advance(); // -> options
		engine.advance(0); // elige "Saludar"
		expect(applied).toContain("affinity:5");
	});

	it("salta comandos intermedios hasta la siguiente línea", () => {
		const engine = createEngine();
		engine.advance(); // options
		engine.advance(0); // "Qué amable!"
		engine.advance(); // salta presence+photo -> "Adiós"
		expect(engine.current).toMatchObject({ kind: "line", text: "Adiós" });
	});

	it("reporta fin de diálogo al terminar el nodo", () => {
		const ended = { called: false };
		const engine = createEngine({ end: () => (ended.called = true) });
		engine.advance(); // options
		engine.advance(0); // "Qué amable!"
		engine.advance(); // "Adiós"
		engine.advance(); // fin
		expect(engine.current.kind).toBe("end");
		expect(ended.called).toBe(true);
	});

	it("expone el título del nodo actual", () => {
		const engine = createEngine();
		expect(engine.getCurrentNodeTitle()).toBe("Start");
	});
});
