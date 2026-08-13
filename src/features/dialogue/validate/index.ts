/**
 * Motor de validación de scripts `.yarn` de In Focus.
 *
 * Escanea todos los capítulos y reporta fugas de texto, decisiones, puntos,
 * variables, condiciones y estructura. Reglas por archivo (con línea exacta)
 * + reglas globales sobre el programa concatenado (nodos, saltos, finales).
 */

import { compile, parseYarn } from "yarn-spinner-runner-ts";
import { loadChapterSources } from "@/features/dialogue/scripts";
import { PHOTO_CATALOG } from "../photos";
import { lintFinalFeasibility } from "./feasibility";
import { lexFile, RUNTIME_VARS } from "./lexer";
import { lintLexedFile } from "./rules";
import { lintChapterFlags, lintDeadOptions, lintReachability, lintTermination } from "./runner";
import { lintLineRhythm, lintMechanics, lintPronouns, lintUnusedPhotos } from "./story";
import { lintGlobal } from "./structure";
import type { SourceFile, ValidationIssue, ValidationReport } from "./types";

/** Valida un conjunto de fuentes `.yarn` y devuelve el reporte completo. */
export function validateSources(sources: SourceFile[]): ValidationReport {
	const issues: ValidationIssue[] = [];

	const declaredVars = new Set<string>([...RUNTIME_VARS]);
	const knownPhotos = new Set(Object.keys(PHOTO_CATALOG));

	const lexedFiles = sources.map((sourceFile) => {
		const lexed = lexFile(sourceFile);
		for (const declare of lexed.declares) declaredVars.add(declare.name);
		return lexed;
	});

	for (const lexed of lexedFiles) {
		try {
			parseYarn(sources.find((s) => s.file === lexed.file)?.source ?? "");
		} catch (error) {
			issues.push({
				rule: "structure:parse-error",
				severity: "error",
				file: lexed.file,
				line: null,
				node: null,
				message: `El capítulo no parsea: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	const context = { declaredVars, knownPhotos };
	for (const lexed of lexedFiles) lintLexedFile(lexed, context, issues);

	// Programa global: estructura, condiciones, factibilidad, runner y narrativa.
	const combined = sources.map((sourceFile) => sourceFile.source).join("\n");
	// Las reglas narrativas de catálogo ($pronouns, fotos sin usar) solo tienen
	// sentido sobre el conjunto real de capítulos, no sobre snippets sueltos.
	const isFullStory = lexedFiles.length > 1 && lexedFiles.every((f) => /^\d{2}-/.test(f.file));
	try {
		const document = parseYarn(combined);
		compile(document);
		lintGlobal(lexedFiles, document, issues);
		lintFinalFeasibility(lexedFiles, document, issues);
		lintReachability(lexedFiles, issues);
		lintChapterFlags(lexedFiles, document, issues);
		lintDeadOptions(lexedFiles, document, issues);
		lintTermination(combined, issues);
		lintMechanics(lexedFiles, issues);
		lintLineRhythm(lexedFiles, issues);
		if (isFullStory) {
			lintPronouns(lexedFiles, issues);
			lintUnusedPhotos(lexedFiles, knownPhotos, issues);
		}
	} catch (error) {
		// Si ya hay un error de parseo atribuido a un capítulo concreto, el
		// error global es el mismo síntoma: no duplicar.
		const alreadyParsed = issues.some((issue) => issue.rule === "structure:parse-error");
		if (!alreadyParsed) {
			issues.push({
				rule: "structure:parse-error",
				severity: "error",
				file: "scripts",
				line: null,
				node: null,
				message: `El programa global no parsea/compila: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	const errors = issues.filter((issue) => issue.severity === "error").length;
	const warnings = issues.length - errors;

	return { issues, errors, warnings, ok: errors === 0 };
}

/** Valida los capítulos reales del juego (scripts/chapters). */
export function validateChapters(): ValidationReport {
	const sources = loadChapterSources().map((chapter) => ({
		file: chapter.file,
		source: chapter.source,
	}));
	return validateSources(sources);
}

/** Imprime un reporte en una sola tabla legible. */
export function formatReport(report: ValidationReport): string {
	const lines = report.issues.map((issue) => {
		const location = issue.line !== null ? `:${issue.line}` : "";
		const node = issue.node ? ` [${issue.node}]` : "";
		return `  ${issue.severity === "error" ? "error" : "warn "}\t${issue.file}${location}${node}\t${issue.message}`;
	});
	return [
		...lines,
		`${report.errors} errores, ${report.warnings} warnings — ${report.ok ? "SCRIPTS VÁLIDOS" : "FUGA DETECTADA"}`,
	].join("\n");
}
