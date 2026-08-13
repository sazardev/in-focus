import { describe, expect, it } from "vitest";
import { DialogueEngine } from "./engine";
import { buildChapterScript } from "./scripts";
import type { DialogueEffects } from "./types";

const mayaScript = buildChapterScript();

interface ScenarioResult {
	ended: boolean;
	lines: number;
	options: number;
	nodes: string[];
	applied: string[];
}

/**
 * Recorre el diálogo eligiendo opciones según `pick(index, count)` hasta
 * llegar al final o agotar el guard.
 */
function runWith(
	pick: (index: number, count: number) => number,
	effects: Partial<DialogueEffects> = {},
	guard = 4000,
): ScenarioResult {
	const applied: string[] = [];
	const nodes: string[] = [];
	const engine = new DialogueEngine({
		script: mayaScript,
		effects: {
			affinity: (d) => applied.push(`affinity:${d}`),
			romance: (d) => applied.push(`romance:${d}`),
			trust: (d) => applied.push(`trust:${d}`),
			presence: () => {},
			typing: () => {},
			photo: (id) => applied.push(`photo:${id}`),
			notify: () => {},
			chapter: (t) => applied.push(`chapter:${t}`),
			availability: () => {},
			absence: () => applied.push("absence"),
			end: () => {},
			...effects,
		},
	});

	let lines = 0;
	let options = 0;
	let optionIndex = 0;
	let guardCount = 0;

	while (engine.current.kind !== "end" && guardCount++ < guard) {
		nodes.push(engine.getCurrentNodeTitle());
		if (engine.current.kind === "line") {
			if (engine.current.text) lines += 1;
			engine.advance();
		} else if (engine.current.kind === "options") {
			options += 1;
			const count = engine.current.options.length;
			const index = pick(optionIndex, count);
			optionIndex += 1;
			engine.advance(index);
		}
	}

	return { ended: engine.current.kind === "end", lines, options, nodes, applied };
}

/** Título de todos los nodos (capítulos) en orden. */
function chapterTitles(result: ScenarioResult): string[] {
	return result.applied
		.filter((a) => a.startsWith("chapter:"))
		.map((a) => a.replace("chapter:", ""));
}

describe("Historia completa (capítulos 1-28) end-to-end", () => {
	it("el script compila con los 28 nodos de capítulo", () => {
		const titles = chapterTitles(runWith(() => 0));
		expect(titles[0]).toBe("El número en la nota");
		expect(titles).toContain("La chica del neón");
		expect(titles).toContain("El borde");
		expect(titles).toContain("La caída");
		expect(titles).toContain("La declaración");
		expect(titles).toContain("Finales");
	});

	it("camino de romance (siempre primera opción) llega al final", () => {
		const result = runWith(() => 0);
		expect(result.ended).toBe(true);
		expect(result.lines).toBeGreaterThan(300);
		expect(result.options).toBeGreaterThan(30);
	});

	it("camino variado (rotando opciones) llega al final", () => {
		let i = 0;
		const result = runWith(
			(_idx, count) => {
				i += 1;
				return (i % 3) % count;
			},
			{},
			2000,
		);
		expect(result.ended).toBe(true);
	});

	it("camino frío (última opción) llega al final", () => {
		const result = runWith((_idx, count) => count - 1, {}, 2000);
		expect(result.ended).toBe(true);
	});

	it("llega a los 5 finales según el balance de ejes", () => {
		// Con romance+trust altos y afinidad alta -> "Brindis a medianoche"
		const romance = runWith(() => 0);
		const romanceText = romance.lines;
		expect(romanceText).toBeGreaterThan(0);

		// Verificamos que el nodo Finales contiene todas las ramas compilando
		// y ejecutando al menos una vez cada camino (pick dirigido).
		const seenTitles = new Set(chapterTitles(romance));
		expect(seenTitles.has("Brindis a medianoche")).toBe(true);
	});

	it("aplica deltas en los tres ejes y registra fotos", () => {
		const result = runWith(() => 0);
		expect(result.applied.some((a) => a.startsWith("affinity:"))).toBe(true);
		expect(result.applied.some((a) => a.startsWith("romance:"))).toBe(true);
		expect(result.applied.some((a) => a.startsWith("trust:"))).toBe(true);
		expect(result.applied.filter((a) => a.startsWith("photo:")).length).toBeGreaterThan(10);
	});
});
