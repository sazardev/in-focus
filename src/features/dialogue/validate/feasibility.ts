/**
 * Factibilidad de los finales (fuga de puntos agregados).
 *
 * Calcula el frente de Pareto de combinaciones (affinity, romance, trust)
 * alcanzables jugando el script completo (cada bloque de opciones aporta una
 * de sus opciones; se asume que todo bloque es alcanzable — sobre-aproximación
 * sana) y verifica que cada condición de los finales del Capítulo 28 tenga al
 * menos un punto factible que la cumpla. Si un final exige un balance que
 * ningún camino puede producir, es un `conditions:final-infeasible`.
 */

import type { YarnDocument, Statement, Command } from "yarn-spinner-runner-ts";
import type { LexedFile } from "./lexer";
import { parseRegion, type AxisBox } from "./conditions";
import type { ValidationIssue } from "./types";

export interface AxisVector {
	affinity: number;
	romance: number;
	trust: number;
}

const AXIS_KEY: Record<string, keyof AxisVector> = {
	affinity: "affinity",
	romance: "romance",
	trust: "trust",
};

function zeroVector(): AxisVector {
	return { affinity: 0, romance: 0, trust: 0 };
}

/**
 * Los ejes son 0-100 por diseño (STORY.md §3) y los umbrales de los finales
 * viven en ese rango; acotar aquí conserva el veredicto de factibilidad y
 * mantiene el frente acotado (101³). `clamp` modela el store multieje.
 */
const clamp = (value: number): number => Math.min(100, Math.max(0, value));

function add(a: AxisVector, b: AxisVector): AxisVector {
	return {
		affinity: clamp(a.affinity + b.affinity),
		romance: clamp(a.romance + b.romance),
		trust: clamp(a.trust + b.trust),
	};
}

function keyOf(point: AxisVector): string {
	return `${point.affinity},${point.romance},${point.trust}`;
}

/**
 * Conjunto alcanzable de (affinity, romance, trust) con valores acotados
 * 0-100. Se conservan TODOS los puntos deduplicados (no solo el frente de
 * Pareto): un final con condición `romance < 60` puede cumplirse en un punto
 * dominado. Se acota por presupuesto; si se desborda, `overflow` avisa.
 */
function reachableAdd(a: Map<string, AxisVector>, vectors: AxisVector[], cap: number): boolean {
	const next = new Map<string, AxisVector>();
	for (const point of a.values()) {
		for (const vector of vectors) {
			const sum = add(point, vector);
			next.set(keyOf(sum), sum);
			if (next.size > cap) return false;
		}
	}
	a.clear();
	for (const [key, value] of next) a.set(key, value);
	return true;
}

/** Delta vector de un comando `<<affinity/romance/trust ±N>>`, o null. */
function deltaOf(command: Command): AxisVector | null {
	const match = /^(affinity|romance|trust)\s+([+-]?\d+)$/.exec(command.content.trim());
	if (!match) return null;
	const vector = zeroVector();
	vector[AXIS_KEY[match[1]]] = Number(match[2]);
	return vector;
}

/**
 * Contribución de un nodo: vectores fijos (comandos fuera de opciones, p. ej.
 * dentro de `<<if>>` — sobre-aproximación) y los grupos de opciones con sus
 * vectores por opción.
 */
export interface NodeContribution {
	title: string;
	fixed: AxisVector;
	groups: AxisVector[][];
}

function collectStatements(statements: Statement[], visit: (statement: Statement) => void): void {
	for (const statement of statements) {
		visit(statement);
		if (statement.type === "OptionGroup") {
			for (const option of statement.options) collectStatements(option.body, visit);
		} else if (statement.type === "If") {
			for (const branch of statement.branches) collectStatements(branch.body, visit);
		} else if (statement.type === "Once") {
			collectStatements(statement.body, visit);
		}
	}
}

/** Extrae la contribución de puntos de un nodo. */
function contributionOf(node: { title: string; body: Statement[] }): NodeContribution {
	const contribution: NodeContribution = { title: node.title, fixed: zeroVector(), groups: [] };

	for (const statement of node.body) {
		if (statement.type === "OptionGroup") {
			const vectors: AxisVector[] = [];
			for (const option of statement.options) {
				let vector = zeroVector();
				for (const inner of option.body) {
					if (inner.type === "Command") {
						const delta = deltaOf(inner);
						if (delta) vector = add(vector, delta);
					}
				}
				vectors.push(vector);
			}
			contribution.groups.push(vectors);
		} else {
			// Comandos top-level e interiores a if/once: se aplican siempre
			// (sobre-aproximación sana para el máximo).
			collectStatements([statement], (inner) => {
				if (inner.type === "Command") {
					const delta = deltaOf(inner);
					if (delta) contribution.fixed = add(contribution.fixed, delta);
				}
			});
		}
	}
	return contribution;
}

/**
 * Conjunto alcanzable de (affinity, romance, trust) tras recorrer los
 * capítulos en orden de archivo, valores acotados 0-100.
 */
export function computeReachableSet(
	lexed: LexedFile[],
	document: YarnDocument,
): { reachable: AxisVector[]; overflow: boolean } {
	const nodeByTitle = new Map(document.nodes.map((node) => [node.title, node]));
	const reachable = new Map<string, AxisVector>();
	reachable.set("0,0,0", zeroVector());
	let overflow = false;

	for (const file of lexed) {
		const nodeTitle = file.nodes[0]?.title;
		const node = nodeTitle ? nodeByTitle.get(nodeTitle) : undefined;
		if (!node) continue;

		const contribution = contributionOf(node);
		// Cada grupo de opciones se procesa de a uno para que el dedupe
		// acote el conjunto en cada paso.
		for (const group of contribution.groups) {
			const ok = reachableAdd(reachable, group, 1_000_000);
			if (!ok) {
				overflow = true;
				return { reachable: [...reachable.values()], overflow };
			}
		}
		if (contribution.fixed.affinity !== 0 || contribution.fixed.romance !== 0 || contribution.fixed.trust !== 0) {
			const ok = reachableAdd(reachable, [contribution.fixed], 1_000_000);
			if (!ok) {
				overflow = true;
				return { reachable: [...reachable.values()], overflow };
			}
		}
	}

	return { reachable: [...reachable.values()], overflow };
}

/** Evalúa si un punto cumple una región (caja por caja). */
function pointInRegion(point: AxisVector, region: AxisBox[]): boolean {
	return region.some((box) => {
		return (
			point.affinity >= box.affinity[0] &&
			point.affinity <= box.affinity[1] &&
			point.romance >= box.romance[0] &&
			point.romance <= box.romance[1] &&
			point.trust >= box.trust[0] &&
			point.trust <= box.trust[1]
		);
	});
}

/**
 * Verifica que cada rama condicional del nodo `Cap28_Finales` (o cualquier
 * nodo cuyo título contenga "Finales") tenga un punto factible en el frente.
 */
export function lintFinalFeasibility(
	lexed: LexedFile[],
	document: YarnDocument,
	issues: ValidationIssue[],
): void {
	const fileByTitle = new Map<string, string>();
	for (const file of lexed) {
		for (const node of file.nodes) fileByTitle.set(node.title, file.file);
	}

	const finalesNode = document.nodes.find((node) => node.title.includes("Finales"));
	if (!finalesNode) return;

	const { reachable, overflow } = computeReachableSet(lexed, document);
	const reachableByKey = new Set(reachable.map(keyOf));

	for (const statement of finalesNode.body) {
		if (statement.type !== "If") continue;
		for (const branch of statement.branches) {
			if (!branch.condition) continue;
			const region = parseRegion(branch.condition);
			if (!region) continue; // condición no modelable en ejes
			const feasible = reachable.some((point) => pointInRegion(point, region));
			if (!feasible) {
				issues.push({
					rule: "conditions:final-infeasible",
					severity: "error",
					file: fileByTitle.get(finalesNode.title) ?? "",
					line: null,
					node: finalesNode.title,
					message: `Final "${branch.condition}" es inalcanzable: ningún recorrido del script produce ese balance de ejes (${reachableByKey.size} balances distintos probados).`,
				});
			}
		}
	}

	if (overflow) {
		issues.push({
			rule: "conditions:final-infeasible",
			severity: "warning",
			file: fileByTitle.get(finalesNode.title) ?? "",
			line: null,
			node: finalesNode.title,
			message: "El conjunto alcanzable se truncó por presupuesto: la factibilidad de los finales pudo no ser exacta.",
		});
	}
}
