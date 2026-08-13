import { describe, expect, it } from "vitest";
import { DIARY } from "./data";
import { QUOTES } from "./quotes";

describe("diario del protagonista", () => {
	it("tiene una entrada por cada uno de los 28 capítulos", () => {
		expect(DIARY).toHaveLength(28);
		expect(DIARY.map((entry) => entry.chapter)).toEqual([...Array(28)].map((_, i) => i + 1));
	});

	it("cada entrada tiene título, resumen, reflexión y nota no vacíos", () => {
		for (const entry of DIARY) {
			expect(entry.title.trim().length).toBeGreaterThan(0);
			expect(entry.recap.trim().length).toBeGreaterThan(0);
			expect(entry.text.trim().length).toBeGreaterThan(0);
			expect(entry.note.trim().length).toBeGreaterThan(0);
		}
	});

	it("tiene una frase de Maya por cada uno de los 28 capítulos", () => {
		expect(QUOTES).toHaveLength(28);
		expect(QUOTES.map((entry) => entry.chapter)).toEqual([...Array(28)].map((_, i) => i + 1));
		for (const entry of QUOTES) {
			expect(entry.quote.trim().length).toBeGreaterThan(0);
		}
	});
});
