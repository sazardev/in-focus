/**
 * Reglas léxicas del motor: se ejecutan por archivo sobre el resultado del
 * lexer y detectan fugas de texto, decisiones, puntos y condiciones con
 * resolución de línea exacta.
 */

import { isAxis, type LexedFile, type ReadToken } from "./lexer";
import type { ValidationIssue } from "./types";

/** Contexto global compartido entre archivos. */
export interface LintContext {
	/** Todas las variables declaradas en la partida (union de `<<declare>>`). */
	declaredVars: Set<string>;
	/** Ids de fotos válidos del catálogo (photos.ts). */
	knownPhotos: Set<string>;
}

function issue(
	issues: ValidationIssue[],
	rule: ValidationIssue["rule"],
	severity: ValidationIssue["severity"],
	file: string,
	line: number | null,
	message: string,
	node: string | null = null,
): void {
	issues.push({ rule, severity, file, line, node, message });
}

/** Detecta duplicados de texto largo de Maya dentro del mismo nodo. */
function lintDuplicateLines(lexed: LexedFile, issues: ValidationIssue[]): void {
	const seenByNode = new Map<string, Map<string, number>>();
	for (const line of lexed.dialogue) {
		if (line.speaker !== "Maya" || line.text.length < 30) continue;
		let seen = seenByNode.get(line.node);
		if (!seen) {
			seen = new Map<string, number>();
			seenByNode.set(line.node, seen);
		}
		const count = seen.get(line.text) ?? 0;
		if (count === 0) seen.set(line.text, 1);
		else if (count === 1) {
			issue(
				issues,
				"text:duplicate-line",
				"warning",
				lexed.file,
				line.line,
				`Línea de Maya duplicada en el nodo "${line.node}": "${line.text.slice(0, 60)}…"`,
				line.node,
			);
			seen.set(line.text, 2);
		}
	}
}

/** Fugas de texto. */
function lintText(lexed: LexedFile, declaredVars: Set<string>, issues: ValidationIssue[]): void {
	for (const line of lexed.dialogue) {
		if (line.text.trim() === "") {
			issue(
				issues,
				"text:empty-line",
				"error",
				lexed.file,
				line.line,
				`Línea vacía (${line.speaker ?? "narrador"} sin texto) — fuga de texto sin contenido.`,
				line.node,
			);
		}
		if (line.speaker && line.speaker !== "Maya") {
			issue(
				issues,
				"text:unknown-speaker",
				"error",
				lexed.file,
				line.line,
				`Personaje desconocido "${line.speaker}" — solo Maya o narrador (sin prefijo) están permitidos.`,
				line.node,
			);
		}
	}

	for (const read of lexed.reads) {
		if (read.source !== "interpolation") continue;
		if (!declaredVars.has(read.name)) {
			issue(
				issues,
				"text:unresolved-interpolation",
				"error",
				lexed.file,
				read.line,
				`Interpolación "{${read.name}}" sin variable declarada ni inyectada por el runtime.`,
			);
		}
	}

	lintDuplicateLines(lexed, issues);
}

/** Fugas de decisiones. */
function lintDecisions(lexed: LexedFile, issues: ValidationIssue[]): void {
	const groups = new Map<number, LexedFile["options"]>();
	for (const option of lexed.options) {
		const bucket = groups.get(option.group) ?? [];
		bucket.push(option);
		groups.set(option.group, bucket);
	}

	for (const options of groups.values()) {
		if (options.length === 1) {
			const option = options[0];
			issue(
				issues,
				"decisions:single-option",
				"warning",
				lexed.file,
				option.line,
				`Bloque con una sola opción "${option.text.slice(0, 40)}" — una decisión sin elección real (SPEC §4.1 exige 2-3).`,
			);
		}
		if (options.length > 4) {
			issue(
				issues,
				"decisions:too-many-options",
				"warning",
				lexed.file,
				options[0].line,
				`Bloque con ${options.length} opciones (SPEC: 2-3). Demasiadas decisiones diluyen la elección.`,
			);
		}

		const seenTexts = new Map<string, number>();
		for (const option of options) {
			const first = seenTexts.get(option.text);
			if (first !== undefined) {
				issue(
					issues,
					"decisions:duplicate-option",
					"error",
					lexed.file,
					option.line,
					`Opción duplicada "${option.text.slice(0, 40)}" (también en la línea ${first}).`,
				);
			} else {
				seenTexts.set(option.text, option.line);
			}

			if (!option.hasDelta && option.effects.length === 0 && option.condition === null) {
				issue(
					issues,
					"decisions:no-consequence",
					"warning",
					lexed.file,
					option.line,
					`Opción "${option.text.slice(0, 40)}" sin consecuencias: no mueve ningún eje (affinity/romance/trust) ni dispara efectos.`,
				);
			}
		}
	}
}

/** Fugas de puntos. */
function lintPoints(lexed: LexedFile, issues: ValidationIssue[]): void {
	for (const set of lexed.sets) {
		if (isAxis(set.name)) {
			issue(
				issues,
				"points:direct-set-axis",
				"error",
				lexed.file,
				set.line,
				`<<set $${set.name} = …>> directo — los ejes solo se mueven con <<${set.name} ±N>> (mantiene el store multieje en sincronía).`,
			);
		}
	}

	for (const delta of lexed.deltas) {
		if (Number.isNaN(delta.delta)) {
			issue(
				issues,
				"points:invalid-delta",
				"error",
				lexed.file,
				delta.line,
				`<<${delta.axis}>> sin delta numérico (esperado <<${delta.axis} ±N>>).`,
			);
			continue;
		}
		if (delta.delta === 0) {
			issue(
				issues,
				"points:zero-delta",
				"warning",
				lexed.file,
				delta.line,
				`<<${delta.axis} 0>> no cambia nada — delta inútil.`,
			);
		}
		if (Math.abs(delta.delta) > 10) {
			issue(
				issues,
				"points:delta-overflow",
				"warning",
				lexed.file,
				delta.line,
				`<<${delta.axis} ${delta.delta}>> fuera del rango STORY.md §3 (±2 a ±10) — un solo delta no debe decidir la partida.`,
			);
		}
		if (delta.insideIf) {
			issue(
				issues,
				"points:in-condition",
				"warning",
				lexed.file,
				delta.line,
				`<<${delta.axis} ${delta.delta}>> dentro de un <<if>> — puntos que se aplican sin que el jugador los elija (fuga de puntos).`,
			);
		}
	}
}

/** Fugas de condiciones (nivel léxico). */
function lintConditions(lexed: LexedFile, issues: ValidationIssue[]): void {
	for (const condition of lexed.ifs) {
		if (condition.kind === "else") continue;
		const expr = condition.expr.trim();
		if (expr === "") {
			issue(
				issues,
				"conditions:empty",
				"error",
				lexed.file,
				condition.line,
				`<<${condition.kind}>> sin expresión — condición vacía.`,
			);
			continue;
		}

		if (/\$(affinity|romance|trust)/.test(expr)) {
			const numberRe = /([<>]=?|==|!=)\s*(\d+)/g;
			let match = numberRe.exec(expr);
			while (match) {
				const value = Number(match[2]);
				if (value < 0 || value > 100) {
					issue(
						issues,
						"conditions:threshold-out-of-range",
						"warning",
						lexed.file,
						condition.line,
						`Comparación "${match[1]} ${match[2]}" sobre un eje fuera del rango 0-100.`,
					);
				}
				match = numberRe.exec(expr);
			}
		}
	}
}

/** Fugas de variables que se resuelven por archivo. */
function lintVariables(
	lexed: LexedFile,
	declaredVars: Set<string>,
	issues: ValidationIssue[],
): void {
	const sourceLabel: Record<ReadToken["source"], string> = {
		condition: "condición",
		interpolation: "interpolación",
		"option-condition": "condición de opción",
	};
	for (const read of lexed.reads) {
		if (declaredVars.has(read.name)) continue;
		if (read.name === "player_name" || read.name === "pronouns") continue;
		issue(
			issues,
			"variables:undeclared",
			"error",
			lexed.file,
			read.line,
			`Variable "$${read.name}" usada en ${sourceLabel[read.source]} sin <<declare>> (ni inyectada por el runtime).`,
		);
	}
}

export function lintLexedFile(
	lexed: LexedFile,
	context: LintContext,
	issues: ValidationIssue[],
): void {
	lintText(lexed, context.declaredVars, issues);
	lintDecisions(lexed, issues);
	lintPoints(lexed, issues);
	lintConditions(lexed, issues);
	lintVariables(lexed, context.declaredVars, issues);

	for (const onceLine of lexed.onceLines) {
		issue(
			issues,
			"structure:once-block",
			"warning",
			lexed.file,
			onceLine,
			"<<once>> encontrado — STORY.md §7 exige flags $cap_NN_done para un resume fiel.",
		);
	}

	for (const photo of lexed.photos) {
		if (!context.knownPhotos.has(photo.id)) {
			issue(
				issues,
				"structure:invalid-photo",
				"error",
				lexed.file,
				photo.line,
				`<<photo ${photo.id}>> no existe en el catálogo (photos.ts) — fuga de asset.`,
			);
		}
	}
}
