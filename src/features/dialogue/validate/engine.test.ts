import { describe, expect, it } from "vitest";
import { validateSources } from "./index";
import type { RuleId, ValidationIssue, ValidationReport } from "./types";

function reportOf(source: string, file = "test.yarn"): ValidationReport {
	return validateSources([{ file, source }]);
}

function rulesOf(source: string, file = "test.yarn"): ValidationIssue[] {
	return reportOf(source, file).issues;
}

function byRule(issues: ValidationIssue[], rule: RuleId): ValidationIssue[] {
	return issues.filter((issue) => issue.rule === rule);
}

const EFFECTS_LINE = "    <<affinity +1>>";

describe("motor de validación", () => {
	it("un script limpio no produce hallazgos", () => {
		const source = `
title: Start
---
<<declare $affinity = 0>>
<<declare $trust = 0>>
<<presence online>>
<<typing true>>
<<photo luz>>
Maya: Hola, bienvenido a esta conversación tan larga y agradable entre nosotros dos
-> Saludar
    <<affinity +5>>
    <<trust +2>>
    Maya: Qué amable, no esperaba una respuesta tan cálida y sincera de tu parte
-> Saludar frío
    <<affinity -3>>
    Maya: Uy, vaya forma tan poco entusiasta de responder a un saludo tan amable
Maya: Adiós, que tengas un día lleno de luz y de buenas noticias por donde vayas
<<set $cap_01_done = true>>
<<jump Cap2_Intro>>
===
title: Cap2_Intro
---
Maya: Llegaste, qué bueno, me alegra mucho verte otra vez por aquí de nuevo
<<fin>>
===
`;
		const issues = rulesOf(source, "01-test.yarn");
		expect(issues).toEqual([]);
	});

	describe("fugas de texto", () => {
		it("detecta personaje desconocido, línea vacía e interpolación sin variable", () => {
			const issues = rulesOf(`
title: Start
---
Maya: Hola
Narrdor: no soy Maya
Maya:
{ghost}
===
`);
			expect(byRule(issues, "text:unknown-speaker")).toHaveLength(1);
			expect(byRule(issues, "text:empty-line")).toHaveLength(1);
			expect(byRule(issues, "text:unresolved-interpolation")).toHaveLength(1);
		});

		it("permite {player_name} y {pronouns} (inyectadas por el runtime)", () => {
			const issues = rulesOf(`
title: Start
---
Maya: Hola {player_name}, ¿{pronouns}?
===
`);
			expect(byRule(issues, "text:unresolved-interpolation")).toHaveLength(0);
		});
	});

	describe("fugas de decisiones", () => {
		it("detecta una opción sin cuerpo (decisión muerta)", () => {
			const issues = rulesOf(`
title: Start
---
-> Muerta
-> Viva
    <<affinity +1>>
    Maya: ok
===
`);
			expect(byRule(issues, "decisions:empty-option")).toHaveLength(1);
		});

		it("detecta opciones duplicadas en el mismo bloque", () => {
			const issues = rulesOf(`
title: Start
---
-> Mismo texto
    ${EFFECTS_LINE}
    Maya: 1
-> Mismo texto
    ${EFFECTS_LINE}
    Maya: 2
===
`);
			expect(byRule(issues, "decisions:duplicate-option")).toHaveLength(1);
		});

		it("advierte sobre bloques con una sola opción", () => {
			const issues = rulesOf(`
title: Start
---
-> Solo
    ${EFFECTS_LINE}
    Maya: ok
===
`);
			const found = byRule(issues, "decisions:single-option");
			expect(found).toHaveLength(1);
			expect(found[0].severity).toBe("warning");
		});

		it("advierte sobre bloques con más de 4 opciones", () => {
			const options = [1, 2, 3, 4, 5]
				.map((n) => `-> Opción ${n}\n    ${EFFECTS_LINE}\n    Maya: ${n}`)
				.join("\n");
			const issues = rulesOf(`\ntitle: Start\n---\n${options}\n===\n`);
			expect(byRule(issues, "decisions:too-many-options")).toHaveLength(1);
		});

		it("advierte sobre opciones sin consecuencias", () => {
			const issues = rulesOf(`
title: Start
---
-> Sin puntos ni efectos
    Maya: ok
-> Con puntos
    ${EFFECTS_LINE}
    Maya: ok
===
`);
			expect(byRule(issues, "decisions:no-consequence")).toHaveLength(1);
		});
	});

	describe("fugas de puntos", () => {
		it("detecta set directo de un eje", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $affinity = 0>>
<<set $affinity = 50>>
Maya: ok
===
`);
			const found = byRule(issues, "points:direct-set-axis");
			expect(found).toHaveLength(1);
			expect(found[0].severity).toBe("error");
		});

		it("detecta deltas inválidos, cero y desbordados", () => {
			const issues = rulesOf(`
title: Start
---
<<affinity>>
<<romance 0>>
<<trust +99>>
Maya: ok
===
`);
			expect(byRule(issues, "points:invalid-delta")).toHaveLength(1);
			expect(byRule(issues, "points:zero-delta")).toHaveLength(1);
			expect(byRule(issues, "points:delta-overflow")).toHaveLength(1);
		});

		it("detecta deltas escondidos dentro de condiciones", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $affinity = 0>>
<<if $affinity >= 50>>
    <<romance +5>>
<<endif>>
Maya: ok
===
`);
			expect(byRule(issues, "points:in-condition")).toHaveLength(1);
		});
	});

	describe("fugas de variables", () => {
		it("detecta variables no declaradas", () => {
			const issues = rulesOf(`
title: Start
---
<<if $fantasma == true>>
    Maya: x
<<endif>>
Maya: ok
===
`);
			const found = byRule(issues, "variables:undeclared");
			expect(found).toHaveLength(1);
			expect(found[0].message).toContain("$fantasma");
		});

		it("detecta variables declaradas que nunca se usan", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $mejores_fotos = 0>>
Maya: ok
===
`);
			expect(byRule(issues, "variables:declared-unused")).toHaveLength(1);
		});

		it("detecta variables que se escriben pero nunca se leen", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $supo_la_verdad = false>>
<<set $supo_la_verdad = true>>
Maya: ok
===
`);
			expect(byRule(issues, "variables:set-never-read")).toHaveLength(1);
		});
	});

	describe("fugas de condiciones", () => {
		it("detecta condiciones vacías", () => {
			const issues = rulesOf(`
title: Start
---
<<if>>
    Maya: x
<<endif>>
Maya: ok
===
`);
			expect(byRule(issues, "conditions:empty")).toHaveLength(1);
		});

		it("detecta ramas inalcanzables (sombreadas)", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $affinity = 0>>
<<if $affinity >= 50>>
    Maya: A
<<elseif $affinity >= 60>>
    Maya: B
<<else>>
    Maya: C
<<endif>>
===
`);
			const found = byRule(issues, "conditions:shadowed-branch");
			expect(found).toHaveLength(1);
			expect(found[0].severity).toBe("error");
		});

		it("advierte sobre ramas solapadas", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $affinity = 0>>
<<if $affinity >= 50>>
    Maya: A
<<elseif $affinity >= 30 && $affinity < 70>>
    Maya: B
<<else>>
    Maya: C
<<endif>>
===
`);
			expect(byRule(issues, "conditions:overlapping-branches")).toHaveLength(1);
		});

		it("advierte sobre umbrales fuera de 0-100", () => {
			const issues = rulesOf(`
title: Start
---
<<declare $affinity = 0>>
<<if $affinity > 150>>
    Maya: A
<<endif>>
===
`);
			expect(byRule(issues, "conditions:threshold-out-of-range")).toHaveLength(1);
		});
	});

	describe("fugas estructurales", () => {
		it("detecta saltos a nodos inexistentes", () => {
			const issues = rulesOf(`
title: Start
---
<<jump NoExiste>>
===
`);
			const found = byRule(issues, "structure:broken-jump");
			expect(found).toHaveLength(1);
			expect(found[0].severity).toBe("error");
		});

		it("detecta nodos duplicados y nodos huérfanos", () => {
			const issues = rulesOf(`
title: Start
---
Maya: hola
===
title: Start
---
Maya: otra vez
===
title: Suelta
---
Maya: nadie salta aquí
===
`);
			expect(byRule(issues, "structure:duplicate-node")).toHaveLength(1);
			expect(byRule(issues, "structure:unreachable-node")).toHaveLength(1);
		});

		it("detecta fotos que no existen en el catálogo", () => {
			const issues = rulesOf(`
title: Start
---
<<photo fotos_inventadas>>
===
`);
			expect(byRule(issues, "structure:invalid-photo")).toHaveLength(1);
		});

		it("advierte sobre <<once>> (debe usar $cap_NN_done)", () => {
			const issues = rulesOf(`
title: Start
---
<<once>>
Maya: una vez
<<endonce>>
===
`);
			expect(byRule(issues, "structure:once-block")).toHaveLength(1);
		});

		it("detecta capítulos que no encadenan al siguiente", () => {
			const issues = rulesOf(
				`
title: Start
---
Maya: hola
===
`,
				"01-test.yarn",
			);
			expect(byRule(issues, "structure:missing-next-jump")).toHaveLength(1);
			expect(byRule(issues, "structure:missing-end-flag")).toHaveLength(1);
		});

		it("no se rompe con un archivo que no parsea", () => {
			const report = reportOf(`
title: Start
---
<<if $affinity > 5>>
Maya: sin cerrar
`);
			expect(byRule(report.issues, "structure:parse-error")).toHaveLength(1);
			expect(report.ok).toBe(false);
		});
	});

	it("agrega el reporte con conteos correctos", () => {
		const report = reportOf(`
title: Start
---
<<jump NoExiste>>
===
`);
		expect(report.ok).toBe(false);
		expect(report.errors).toBeGreaterThanOrEqual(1);
		expect(report.warnings).toBeGreaterThanOrEqual(0);
	});
});
