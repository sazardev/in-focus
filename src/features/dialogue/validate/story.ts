/**
 * Cumplimiento narrativo (STORY.md §6): mecánicas por capítulo, ritmo de
 * línea, uso de `$pronouns` y fotos del catálogo que nunca se usan.
 */

import type { LexedFile } from "./lexer";
import type { ValidationIssue } from "./types";

/** Mecánicas de STORY.md §6 que el script puede disparar con comandos. */
const MECHANICS = new Set(["photo", "absence", "presence", "typing", "notify"]);

const MAX_LINE_LENGTH = 150;
const AVG_MIN = 60;
const AVG_MAX = 120;

/** Cada capítulo debe usar al menos 3 mecánicas narrativas (STORY.md §6). */
export function lintMechanics(lexed: LexedFile[], issues: ValidationIssue[]): void {
	for (const file of lexed) {
		if (!/^\d{2}-/.test(file.file)) continue;
		const used = new Set<string>();
		for (const command of file.commands) {
			if (MECHANICS.has(command.name)) used.add(command.name);
		}
		if (used.size < 3) {
			issues.push({
				rule: "story:min-mechanics",
				severity: "warning",
				file: file.file,
				line: null,
				node: null,
				message: `Solo ${used.size} mecánicas distintas (${[...used].join(", ") || "ninguna"}) — STORY.md §6 exige al menos 3 por capítulo.`,
			});
		}
	}
}

/** Ritmo de línea: máxima por línea y media por capítulo (STORY.md §6). */
export function lintLineRhythm(lexed: LexedFile[], issues: ValidationIssue[]): void {
	for (const file of lexed) {
		const lines = file.dialogue.filter((line) => line.text.length > 0);
		for (const line of lines) {
			if (line.text.length > MAX_LINE_LENGTH) {
				issues.push({
					rule: "story:line-too-long",
					severity: "warning",
					file: file.file,
					line: line.line,
					node: line.node,
					message: `Línea de ${line.text.length} caracteres (máx. ${MAX_LINE_LENGTH}) — un mensaje tan largo rompe el ritmo de chat.`,
				});
			}
		}

		if (lines.length === 0) continue;
		const average = lines.reduce((sum, line) => sum + line.text.length, 0) / lines.length;
		if (average < AVG_MIN || average > AVG_MAX) {
			issues.push({
				rule: "story:average-line-length",
				severity: "warning",
				file: file.file,
				line: null,
				node: null,
				message: `Longitud media de línea ${average.toFixed(0)} caracteres (STORY.md §6: ${AVG_MIN}-${AVG_MAX}) — párrafos muy cortos o muy densos.`,
			});
		}
	}
}

/** `$pronouns` promete adaptar el lenguaje (STORY.md §2); si nunca se lee, avisa. */
export function lintPronouns(lexed: LexedFile[], issues: ValidationIssue[]): void {
	const read = lexed.some((file) => file.reads.some((token) => token.name === "pronouns"));
	if (!read) {
		issues.push({
			rule: "story:pronouns-unused",
			severity: "warning",
			file: "scripts",
			line: null,
			node: null,
			message: "$pronouns nunca se lee en una condición — Maya promete adaptar su lenguaje (STORY.md §2) pero ningún <<if $pronouns>> existe.",
		});
	}
}

/** Fotos del catálogo que nunca se referencian (assets muertos). */
export function lintUnusedPhotos(
	lexed: LexedFile[],
	knownPhotos: Set<string>,
	issues: ValidationIssue[],
): void {
	const referenced = new Set<string>();
	for (const file of lexed) {
		for (const photo of file.photos) referenced.add(photo.id);
	}
	for (const id of knownPhotos) {
		if (!referenced.has(id)) {
			issues.push({
				rule: "story:unused-photo",
				severity: "warning",
				file: "scripts",
				line: null,
				node: null,
				message: `Foto "${id}" del catálogo nunca se envía con <<photo>> — asset muerto.`,
			});
		}
	}
}
