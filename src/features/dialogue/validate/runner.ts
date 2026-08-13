/**
 * Explorador de ejecución (runner).
 *
 * Comprueba propiedades que solo se pueden garantizar recorriendo el grafo y
 * ejecutando de verdad el programa Yarn:
 *  - **Alcance**: todo nodo es alcanzable siguiendo saltos desde `Start`.
 *  - **Ciclos**: no hay bucles entre nodos (historia infinita).
 *  - **Terminación**: al menos un camino completo llega al final sin
 *    atascarse (ejecución real con `YarnRunner`, programa compilado 1 vez).
 *  - **Flag antes del jump**: `$cap_NN_done` se setea en el cuerpo principal
 *    del capítulo ANTES del `<<jump>>` al siguiente.
 *  - **Opciones muertas**: condiciones `[if]` de opciones sin ningún valor
 *    factible.
 */

import {
	compile,
	type IRProgram,
	parseYarn,
	type YarnDocument,
	YarnRunner,
} from "yarn-spinner-runner-ts";
import { parseRegion } from "./conditions";
import type { LexedFile } from "./lexer";
import type { ValidationIssue } from "./types";

const TERMINATION_BUDGET = 20_000;

/** Grafo nodo → destinos de salto, atribuyendo cada `<<jump>>` a su nodo.
 *  Así los archivos con varios nodos (tests/escenarios) no mezclan saltos. */
function buildGraph(lexed: LexedFile[]): Map<string, string[]> {
	const graph = new Map<string, string[]>();
	for (const file of lexed) {
		const byNode = new Map<string, string[]>();
		for (const jump of file.jumps) {
			const list = byNode.get(jump.node) ?? [];
			list.push(jump.target);
			byNode.set(jump.node, list);
		}
		for (const node of file.nodes) {
			graph.set(node.title, byNode.get(node.title) ?? []);
		}
	}
	return graph;
}

/** Alcance hacia adelante desde `Start` + detección de ciclos. */
export function lintReachability(lexed: LexedFile[], issues: ValidationIssue[]): void {
	const graph = buildGraph(lexed);
	const fileByTitle = new Map<string, { file: string; line: number }>();
	for (const file of lexed) {
		for (const node of file.nodes)
			fileByTitle.set(node.title, { file: file.file, line: node.line });
	}

	// BFS desde Start.
	const reachable = new Set<string>();
	const queue = ["Start"];
	while (queue.length > 0) {
		const title = queue.shift() as string;
		if (reachable.has(title)) continue;
		reachable.add(title);
		for (const target of graph.get(title) ?? []) {
			if (graph.has(target) && !reachable.has(target)) queue.push(target);
		}
	}

	for (const title of graph.keys()) {
		if (!reachable.has(title)) {
			const origin = fileByTitle.get(title);
			issues.push({
				rule: "structure:unreachable-node",
				severity: "warning",
				file: origin?.file ?? "",
				line: origin?.line ?? null,
				node: title,
				message: `Nodo "${title}" no es alcanzable desde Start — historia muerta o cadena de saltos rota.`,
			});
		}
	}

	// Detección de ciclos (DFS con colores).
	const colors = new Map<string, "grey" | "black">();
	const stack: string[] = [];
	const visit = (title: string): void => {
		colors.set(title, "grey");
		stack.push(title);
		for (const target of graph.get(title) ?? []) {
			const color = colors.get(target);
			if (color === "grey") {
				const origin = fileByTitle.get(target);
				issues.push({
					rule: "structure:cycle",
					severity: "warning",
					file: origin?.file ?? "",
					line: origin?.line ?? null,
					node: target,
					message: `Ciclo detectado en el grafo de nodos (${[...stack, target].join(" → ")}) — historia infinita.`,
				});
			} else if (color !== "black" && graph.has(target)) {
				visit(target);
			}
		}
		stack.pop();
		colors.set(title, "black");
	};
	for (const title of graph.keys()) {
		if (colors.get(title) !== "black") visit(title);
	}
}

/** Terminación real: ejecuta al menos dos estrategias de opciones. */
export function lintTermination(combinedSource: string, issues: ValidationIssue[]): void {
	let program: IRProgram;
	try {
		program = compile(parseYarn(combinedSource));
	} catch {
		return; // el error de parseo ya lo reporta el orquestador
	}

	const strategies = [
		{ label: "siempre la 1ª opción", pick: () => 0 },
		{ label: "siempre la última opción", pick: (count: number) => count - 1 },
	] as const;

	for (const strategy of strategies) {
		const runner = new YarnRunner(program, {
			startAt: "Start",
			variables: { player_name: "Jugador", pronouns: "neutral" },
			handleCommand: () => {},
		});

		let steps = 0;
		let lastNode = "Start";
		while (!isStoryEnd(runner.currentResult) && steps++ < TERMINATION_BUDGET) {
			lastNode = runner.getCurrentNodeTitle();
			const result = runner.currentResult;
			if (result?.type === "options") {
				runner.advance(strategy.pick(result.options.length));
			} else {
				runner.advance();
			}
		}

		if (!isStoryEnd(runner.currentResult)) {
			issues.push({
				rule: "structure:no-termination",
				severity: "error",
				file: "scripts",
				line: null,
				node: lastNode,
				message: `El camino "${strategy.label}" no termina en ${TERMINATION_BUDGET} pasos (atascado en "${lastNode}") — ciclo o falta de <<fin>>/<<jump>>.`,
			});
		}
	}
}

/** Fin de historia: sin frame, o el marcador terminal (texto vacío + fin). */
function isStoryEnd(result: unknown): boolean {
	if (result === null || result === undefined) return true;
	if (typeof result !== "object") return true;
	const frame = result as { type?: string; isDialogueEnd?: boolean; text?: string };
	return frame.type === "text" && frame.isDialogueEnd === true && frame.text === "";
}

/** `$cap_NN_done` debe setearse en el cuerpo principal antes del `<<jump>>`. */
export function lintChapterFlags(
	lexed: LexedFile[],
	document: YarnDocument,
	issues: ValidationIssue[],
): void {
	const nodeByTitle = new Map(document.nodes.map((node) => [node.title, node]));

	for (const file of lexed) {
		const match = /^(\d{2})-/.exec(file.file);
		if (!match) continue;
		const number = Number(match[1]);
		if (number === 28) continue;

		const nodeTitle = file.nodes[0]?.title;
		const node = nodeTitle ? nodeByTitle.get(nodeTitle) : undefined;
		if (!node) continue;

		const capVar = `cap_${match[1]}_done`;
		let flagIndex = -1;
		let jumpIndex = -1;
		let flagLine: number | null = null;

		node.body.forEach((statement, index) => {
			if (statement.type !== "Command") return;
			const content = statement.content.trim();
			if (flagIndex === -1 && new RegExp(`^set\\s+\\$${capVar}\\s*=`).test(content)) {
				flagIndex = index;
				flagLine = findLineInNode(file, content);
			}
			if (jumpIndex === -1 && /^jump\s+/.test(content)) {
				jumpIndex = index;
			}
		});

		if (flagIndex === -1) {
			issues.push({
				rule: "structure:missing-end-flag",
				severity: "error",
				file: file.file,
				line: null,
				node: nodeTitle,
				message: `El capítulo ${number} no setea $${capVar} en su cuerpo principal — el resume no puede confirmar el capítulo.`,
			});
		} else if (jumpIndex !== -1 && flagIndex >= jumpIndex) {
			issues.push({
				rule: "structure:flag-after-jump",
				severity: "error",
				file: file.file,
				line: flagLine ?? null,
				node: nodeTitle,
				message: `$${capVar} se setea después del <<jump>> (o en una rama) — el salto ocurre antes de marcar el capítulo.`,
			});
		}
	}
}

function findLineInNode(file: LexedFile, content: string): number | null {
	for (const command of file.commands) {
		if (command.raw.trim() === content) return command.line;
	}
	return null;
}

/** Opciones con condición `[if]` cuyo rango de ejes está vacío. */
export function lintDeadOptions(
	lexed: LexedFile[],
	document: YarnDocument,
	issues: ValidationIssue[],
): void {
	const fileByTitle = new Map<string, string>();
	for (const file of lexed) {
		for (const node of file.nodes) fileByTitle.set(node.title, file.file);
	}

	for (const node of document.nodes) {
		const walk = (statements: YarnDocument["nodes"][number]["body"]): void => {
			for (const statement of statements) {
				if (statement.type === "OptionGroup") {
					for (const option of statement.options) {
						if (!option.condition) continue;
						const region = parseRegion(option.condition);
						if (region && region.length === 0) {
							issues.push({
								rule: "decisions:dead-option",
								severity: "error",
								file: fileByTitle.get(node.title) ?? "",
								line: null,
								node: node.title,
								message: `Opción "${option.text.slice(0, 40)}" con condición "${option.condition}" imposible — nadie podrá elegirla.`,
							});
						}
					}
					for (const option of statement.options) walk(option.body);
				} else if (statement.type === "If") {
					for (const branch of statement.branches) walk(branch.body);
				} else if (statement.type === "Once") {
					walk(statement.body);
				}
			}
		};
		walk(node.body);
	}
}
