import { describe, expect, it } from "vitest";
import { DialogueEngine } from "./engine";
import { buildChapterScript } from "./scripts";

function runEnding(vars: Record<string, number>, guard = 300) {
	const engine = new DialogueEngine({
		script: buildChapterScript(),
		startAt: "Cap28_Finales",
		variables: {
			affinity: 0,
			romance: 0,
			trust: 0,
			player_name: "Alex",
			pronouns: "neutral",
			...vars,
		},
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
		},
	});

	const seen: string[] = [];
	let guardCount = 0;
	while (engine.current.kind !== "end" && guardCount++ < guard) {
		if (engine.current.kind === "line" && engine.current.text) seen.push(engine.current.text);
		else if (engine.current.kind === "options") break;
		engine.advance();
	}
	return seen;
}

describe("Cap28_Finales: los 5 finales según el balance de ejes", () => {
	it("romance+trust altos → Brindis a medianoche", () => {
		const seen = runEnding({ affinity: 80, romance: 80, trust: 80 });
		expect(seen.some((l) => l.includes("Te quiero"))).toBe(true);
		expect(seen.some((l) => l.includes("Buenas noches, mi historia favorita"))).toBe(true);
		expect(seen.some((l) => l.includes("Me mudé a otra ciudad"))).toBe(false);
	});

	it("romance alto con trust roto → Reencuentro (oculto)", () => {
		const seen = runEnding({ affinity: 60, romance: 60, trust: 20 });
		expect(seen.some((l) => l.includes("¿Todavía existe la chica del neón?"))).toBe(true);
		expect(seen.some((l) => l.includes("Bienvenido de vuelta"))).toBe(true);
	});

	it("afinidad alta, romance bajo → Mi mejor amiga", () => {
		const seen = runEnding({ affinity: 80, romance: 30, trust: 80 });
		expect(seen.some((l) => l.includes("Me mudé a otra ciudad"))).toBe(true);
		expect(seen.some((l) => l.includes("ni de pedo"))).toBe(true);
		expect(seen.some((l) => l.includes("Te quiero"))).toBe(false);
	});

	it("romance medio, trust bajo → La que casi fue", () => {
		const seen = runEnding({ affinity: 50, romance: 50, trust: 40 });
		expect(seen.some((l) => l.includes("el timing no era el nuestro"))).toBe(true);
		expect(seen.some((l) => l.includes("algún día"))).toBe(true);
	});

	it("afinidad o trust muy bajos → Sin despedida", () => {
		const seen = runEnding({ affinity: 20, romance: 10, trust: 10 });
		expect(seen.some((l) => l.includes("no va a tener un final bonito"))).toBe(true);
		expect(seen.some((l) => l.includes("cuando encuentres otra caja"))).toBe(true);
	});

	it("cualquier otro balance → El destino con buen ojo", () => {
		const seen = runEnding({ affinity: 60, romance: 40, trust: 70 });
		expect(seen.some((l) => l.includes("Gracias por ser mi historia"))).toBe(true);
	});
});
