import { describe, expect, it } from "vitest";
import { validateChapters } from "./index";
import type { ValidationIssue } from "./types";

const report = validateChapters();

function byRule(issues: ValidationIssue[], rule: ValidationIssue["rule"]): ValidationIssue[] {
	return issues.filter((issue) => issue.rule === rule);
}

describe("gate de scripts: los 28 capítulos no deben fugarse", () => {
	it("no hay errores (el juego juega sin romperse)", () => {
		const errors = report.issues.filter((issue) => issue.severity === "error");
		expect(errors).toEqual([]);
	});

	it("todos los capítulos encadenan y cierran con sus flags", () => {
		expect(byRule(report.issues, "structure:missing-next-jump")).toEqual([]);
		expect(byRule(report.issues, "structure:missing-end-flag")).toEqual([]);
		expect(byRule(report.issues, "structure:missing-fin")).toEqual([]);
	});

	it("no hay saltos rotos, nodos duplicados ni fotos inválidas", () => {
		expect(byRule(report.issues, "structure:broken-jump")).toEqual([]);
		expect(byRule(report.issues, "structure:duplicate-node")).toEqual([]);
		expect(byRule(report.issues, "structure:invalid-photo")).toEqual([]);
	});

	it("cada decisión tiene consecuencias y deltas válidos", () => {
		expect(byRule(report.issues, "decisions:empty-option")).toEqual([]);
		expect(byRule(report.issues, "decisions:duplicate-option")).toEqual([]);
		expect(byRule(report.issues, "points:invalid-delta")).toEqual([]);
		expect(byRule(report.issues, "points:direct-set-axis")).toEqual([]);
	});

	it("las tramas del rollo están cableadas (variables en uso)", () => {
		const dead = byRule(report.issues, "variables:declared-unused").map((issue) => issue.message);
		expect(dead.some((message) => message.includes("$mejores_fotos"))).toBe(false);
		expect(dead.some((message) => message.includes("$rollo_revelado"))).toBe(false);

		const unread = byRule(report.issues, "variables:set-never-read").map((issue) => issue.message);
		expect(unread.some((message) => message.includes("$supo_la_verdad"))).toBe(false);
	});

	it("advierte de los solapes de condiciones de los finales", () => {
		const overlaps = byRule(report.issues, "conditions:overlapping-branches");
		expect(overlaps.length).toBeGreaterThanOrEqual(3);
		for (const overlap of overlaps) {
			expect(overlap.node).toBe("Cap28_Finales");
		}
	});

	it("el reporte está sano (conteos consistentes)", () => {
		const { errors, warnings, issues, ok } = report;
		expect(ok).toBe(true);
		expect(errors + warnings).toBe(issues.length);
	});
});
