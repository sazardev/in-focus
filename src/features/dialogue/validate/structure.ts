/**
 * Reglas estructurales globales del motor: se ejecutan sobre todos los
 * capítulos a la vez y detectan fugas de estructura (nodos duplicados o
 * huérfanos, saltos rotos, encadenamiento de capítulos roto, variables
 * muertas) y fugas de condiciones (ramas de final inalcanzables).
 */

import type { Statement, YarnDocument, YarnNode } from "yarn-spinner-runner-ts";
import { analyzeBranchChain, type BranchLike } from "./conditions";
import { isAxis, type LexedFile } from "./lexer";
import type { ValidationIssue } from "./types";

const CAP_FLAG_RE = /^cap_\d+_done$/;

/** Recorre todos los Statement de un nodo (incluidos anidados). */
function walkStatements(statements: Statement[], visit: (statement: Statement) => void): void {
	for (const statement of statements) {
		visit(statement);
		if (statement.type === "OptionGroup") {
			for (const option of statement.options) walkStatements(option.body, visit);
		} else if (statement.type === "If") {
			for (const branch of statement.branches) walkStatements(branch.body, visit);
		} else if (statement.type === "Once") {
			walkStatements(statement.body, visit);
		}
	}
}

function findBranchLine(
	node: YarnNode,
	lexedByTitle: Map<string, LexedFile>,
	expr: string,
): number | null {
	const lexed = lexedByTitle.get(node.title);
	if (!lexed) return null;
	for (const condition of lexed.ifs) {
		if (condition.expr.trim() === expr.trim()) return condition.line;
	}
	return null;
}

/** Valida la estructura global de todos los capítulos concatenados. */
export function lintGlobal(
	lexed: LexedFile[],
	document: YarnDocument,
	issues: ValidationIssue[],
): void {
	const allNodes = new Map<string, { file: string; line: number }>();
	for (const file of lexed) {
		for (const node of file.nodes) {
			const existing = allNodes.get(node.title);
			if (existing) {
				issues.push({
					rule: "structure:duplicate-node",
					severity: "error",
					file: file.file,
					line: node.line,
					node: node.title,
					message: `Nodo "${node.title}" duplicado (también en ${existing.file}) — los títulos deben ser únicos a nivel global.`,
				});
			} else {
				allNodes.set(node.title, { file: file.file, line: node.line });
			}
		}
	}

	// Saltos a nodos inexistentes.
	const referenced = new Set<string>();
	for (const file of lexed) {
		for (const jump of file.jumps) {
			referenced.add(jump.target);
			if (!allNodes.has(jump.target)) {
				issues.push({
					rule: "structure:broken-jump",
					severity: "error",
					file: file.file,
					line: jump.line,
					node: jump.target,
					message: `<<jump ${jump.target}>> apunta a un nodo que no existe — fuga de historia.`,
				});
			}
		}
	}

	lintVariables(lexed, issues);
	lintChaining(lexed, issues);
	lintEmptyOptions(lexed, document, issues);
	lintFinales(lexed, document, issues);
}

/** Opciones sin cuerpo: decisiones muertas que no hacen nada al elegirlas. */
function lintEmptyOptions(
	lexed: LexedFile[],
	document: YarnDocument,
	issues: ValidationIssue[],
): void {
	const fileByTitle = new Map<string, string>();
	for (const file of lexed) {
		for (const node of file.nodes) fileByTitle.set(node.title, file.file);
	}

	for (const node of document.nodes) {
		walkStatements(node.body, (statement) => {
			if (statement.type !== "OptionGroup") return;
			for (const option of statement.options) {
				if (option.body.length === 0) {
					issues.push({
						rule: "decisions:empty-option",
						severity: "error",
						file: fileByTitle.get(node.title) ?? "",
						line: null,
						node: node.title,
						message: `Opción "${option.text.slice(0, 40)}" sin cuerpo — al elegirla no pasa nada (decisión muerta).`,
					});
				}
			}
		});
	}
}

/** Variables declaradas/leídas/seteadas a nivel global. */
function lintVariables(lexed: LexedFile[], issues: ValidationIssue[]): void {
	const declared = new Set<string>();
	const read = new Set<string>();
	const set = new Set<string>();
	const declarePos = new Map<string, { file: string; fileIndex: number; line: number }>();
	const setLine = new Map<string, { file: string; line: number }>();
	const declareType = new Map<string, "bool" | "number" | "string" | null>();

	for (const [fileIndex, file] of lexed.entries()) {
		for (const token of file.declares) {
			declared.add(token.name);
			if (!declarePos.has(token.name))
				declarePos.set(token.name, { file: file.file, fileIndex, line: token.line });
			if (!declareType.has(token.name)) declareType.set(token.name, typeOf(token.value));
		}
		for (const token of file.reads) read.add(token.name);
		for (const token of file.sets) {
			set.add(token.name);
			if (!setLine.has(token.name)) setLine.set(token.name, { file: file.file, line: token.line });
		}
	}

	for (const name of declared) {
		if (CAP_FLAG_RE.test(name) || isAxis(name)) continue;
		if (!read.has(name) && !set.has(name)) {
			const origin = declarePos.get(name);
			issues.push({
				rule: "variables:declared-unused",
				severity: "warning",
				file: origin?.file ?? "",
				line: origin?.line ?? null,
				node: null,
				message: `Variable "$${name}" declarada pero nunca usada — trama prometida sin cablear.`,
			});
		}
	}

	for (const name of set) {
		if (CAP_FLAG_RE.test(name) || isAxis(name)) continue;
		if (!read.has(name)) {
			const origin = setLine.get(name);
			issues.push({
				rule: "variables:set-never-read",
				severity: "warning",
				file: origin?.file ?? "",
				line: origin?.line ?? null,
				node: null,
				message: `Variable "$${name}" se escribe pero nunca se lee en una condición/interpolación — dato muerto.`,
			});
		}
	}

	// Flujo: lecturas antes de declarar (en orden de archivo).
	for (const [fileIndex, file] of lexed.entries()) {
		for (const token of file.reads) {
			const pos = declarePos.get(token.name);
			if (!pos) continue; // runtime o no declarada (ya cubierto)
			if (fileIndex < pos.fileIndex || (fileIndex === pos.fileIndex && token.line < pos.line)) {
				issues.push({
					rule: "variables:read-before-declare",
					severity: "warning",
					file: file.file,
					line: token.line,
					node: null,
					message: `Variable "$${token.name}" leída (${token.source}) antes de su <<declare>> en ${pos.file}:${pos.line}.`,
				});
			}
		}
	}

	// Flujo: tipos coherentes entre <<declare>> y <<set>>.
	for (const file of lexed) {
		for (const token of file.sets) {
			const expected = declareType.get(token.name);
			if (expected === undefined || expected === null) continue;
			const actual = typeOf(token.value);
			if (actual !== null && expected !== actual) {
				issues.push({
					rule: "variables:type-mismatch",
					severity: "warning",
					file: file.file,
					line: token.line,
					node: null,
					message: `"$${token.name}" declarada como ${expected} pero se setea con ${actual} (${token.value}).`,
				});
			}
		}
	}
}

function typeOf(value: string): "bool" | "number" | "string" | null {
	const trimmed = value.trim();
	if (trimmed === "true" || trimmed === "false") return "bool";
	if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) return "number";
	// Expresiones ($var, operadores, llamadas): no se puede saber el tipo sin ejecutar.
	if (/[$+\-*/()[\],]/.test(trimmed)) return null;
	return "string";
}

/** Encadenamiento de capítulos: salto al siguiente y convención de nombres. */
function lintChaining(lexed: LexedFile[], issues: ValidationIssue[]): void {
	for (const file of lexed) {
		const match = /^(\d{2})-/.exec(file.file);
		if (!match) continue;
		const number = Number(match[1]);

		const jumpTargets = file.jumps.map((jump) => jump.target);
		const hasFin = file.commands.some((command) => command.name === "fin");

		// Convención de nombres: nodo Cap{NN}_… (Start solo en el capítulo 1).
		const nodeTitle = file.nodes[0]?.title;
		if (number > 1 && nodeTitle && !nodeTitle.startsWith(`Cap${number}_`)) {
			issues.push({
				rule: "structure:node-naming",
				severity: "warning",
				file: file.file,
				line: file.nodes[0]?.line ?? null,
				node: nodeTitle,
				message: `Nodo "${nodeTitle}" no sigue el prefijo Cap${number}_ — rompe la convención de nombres global.`,
			});
		}

		if (number === 28) {
			if (!hasFin) {
				issues.push({
					rule: "structure:missing-fin",
					severity: "warning",
					file: file.file,
					line: null,
					node: null,
					message:
						"El capítulo final (28) no termina con <<fin>> — los finales no cierran el diálogo.",
				});
			}
			continue;
		}

		const nextPrefix = `Cap${number + 1}`;
		if (!jumpTargets.some((target) => target.startsWith(nextPrefix))) {
			issues.push({
				rule: "structure:missing-next-jump",
				severity: "error",
				file: file.file,
				line: null,
				node: null,
				message: `El capítulo ${number} no salta al siguiente (<<jump ${nextPrefix}…>>) — la historia se corta.`,
			});
		}
	}
}

/** Análisis de cadenas <<if>>/<<elseif>> (finales y cualquier rama condicional). */
function lintFinales(lexed: LexedFile[], document: YarnDocument, issues: ValidationIssue[]): void {
	const lexedByTitle = new Map<string, LexedFile>();
	for (const file of lexed) {
		for (const node of file.nodes) lexedByTitle.set(node.title, file);
	}

	for (const node of document.nodes) {
		const file = lexedByTitle.get(node.title)?.file ?? "";
		walkStatements(node.body, (statement) => {
			if (statement.type !== "If") return;
			const branches: BranchLike[] = statement.branches.map((branch) => ({
				expr: branch.condition,
				line: branch.condition ? findBranchLine(node, lexedByTitle, branch.condition) : null,
			}));
			analyzeBranchChain(branches, file, node.title, issues);
		});
	}
}
