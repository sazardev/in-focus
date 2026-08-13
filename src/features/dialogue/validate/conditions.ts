/**
 * Análisis de condiciones por intervalos para detectar fugas de condiciones:
 * ramas de `<<if>>` que jamás se alcanzan (sombreadas por ramas anteriores)
 * y regiones solapadas cuyo orden decide silenciosamente el resultado.
 *
 * Modela cada condición como una caja por eje (`affinity`, `romance`,
 * `trust`) en [0,100]. Solo es sano cuando la condición referencia
 * exclusivamente los tres ejes; si aparece otra variable, se descarta el
 * análisis de esa cadena (return null / skip).
 */

import type { ValidationIssue } from "./types";

export interface AxisBox {
	affinity: [number, number];
	romance: [number, number];
	trust: [number, number];
}

export interface BranchLike {
	expr: string | null;
	line: number | null;
}

const AXES: (keyof AxisBox)[] = ["affinity", "romance", "trust"];

function emptyBox(): AxisBox {
	return { affinity: [0, 100], romance: [0, 100], trust: [0, 100] };
}

/** Divide una expresión por un operador binario a nivel raíz (fuera de paréntesis). */
function splitTopLevel(expr: string, op: string): string[] {
	const parts: string[] = [];
	let depth = 0;
	let current = "";
	for (let i = 0; i < expr.length; i++) {
		const char = expr[i];
		if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);
		if (depth === 0 && char === op[0] && expr[i + 1] === op[1]) {
			if (current.trim()) parts.push(current.trim());
			current = "";
			i += 1;
			continue;
		}
		current += char;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
}

function isFeasible(box: AxisBox): boolean {
	return AXES.every((axis) => box[axis][0] <= box[axis][1]);
}

/**
 * Traduce una condición a una lista de cajas (una por disyuntiva `||`).
 * Devuelve null si no se puede modelar (variables fuera de los ejes,
 * funciones, `!=`, etc.).
 */
export function parseRegion(expr: string): AxisBox[] | null {
	const disjuncts = splitTopLevel(expr.trim(), "||");
	const boxes: AxisBox[] = [];

	for (const disjunct of disjuncts) {
		const box = emptyBox();
		const conjuncts = splitTopLevel(disjunct, "&&");
		let modelable = true;

		for (const conjunct of conjuncts) {
			const match = /^\$\s?(\w+)\s*(>=|<=|>|<|==)\s*(\d+)$/.exec(conjunct.trim());
			if (!match) {
				modelable = false;
				break;
			}
			const axis = match[1] as keyof AxisBox;
			const axisSet = new Set<keyof AxisBox>(AXES);
			if (!axisSet.has(axis)) {
				modelable = false;
				break;
			}
			const operator = match[2];
			const value = Number(match[3]);
			const range = box[axis];
			if (operator === ">=") range[0] = Math.max(range[0], value);
			else if (operator === ">") range[0] = Math.max(range[0], value + 1);
			else if (operator === "<=") range[1] = Math.min(range[1], value);
			else if (operator === "<") range[1] = Math.min(range[1], value - 1);
			else if (operator === "==") {
				range[0] = Math.max(range[0], value);
				range[1] = Math.min(range[1], value);
			}
		}

		if (!modelable) return null;
		if (isFeasible(box)) boxes.push(box);
	}
	return boxes;
}

function intervalContains(outer: [number, number], inner: [number, number]): boolean {
	return outer[0] <= inner[0] && outer[1] >= inner[1];
}

function intervalOverlap(a: [number, number], b: [number, number]): boolean {
	return a[0] <= b[1] && b[0] <= a[1];
}

function boxContains(outer: AxisBox, inner: AxisBox): boolean {
	return AXES.every((axis) => intervalContains(outer[axis], inner[axis]));
}

function boxesOverlap(a: AxisBox[], b: AxisBox[]): boolean {
	for (const boxA of a) {
		for (const boxB of b) {
			if (AXES.every((axis) => intervalOverlap(boxA[axis], boxB[axis]))) return true;
		}
	}
	return false;
}

/**
 * Analiza una cadena de ramas (`<<if>>`/`<<elseif>>`) en orden.
 * Reporta:
 *  - `conditions:shadowed-branch` (error) si una rama no tiene ningún punto
 *    factible que no cubran ya las ramas anteriores (inalcanzable), o si su
 *    condición es directamente imposible.
 *  - `conditions:overlapping-branches` (warning) si dos ramas factibles se
 *    solapan y el orden decide en silencio.
 */
export function analyzeBranchChain(
	branches: BranchLike[],
	file: string,
	node: string,
	issues: ValidationIssue[],
): void {
	const regions: (AxisBox[] | null)[] = branches.map((branch) =>
		branch.expr ? parseRegion(branch.expr) : null,
	);

	// Si alguna condición no se puede modelar, el análisis sería insano.
	const unmodelable = branches.some((branch, index) => branch.expr && regions[index] === null);
	if (unmodelable) return;

	const shadowed: boolean[] = branches.map(() => false);

	for (let i = 0; i < branches.length; i++) {
		const branch = branches[i];
		const region = regions[i];
		if (!branch.expr || region === null) continue;

		// Condición imposible (intervalos vacíos).
		if (region.length === 0) {
			shadowed[i] = true;
			issues.push({
				rule: "conditions:shadowed-branch",
				severity: "error",
				file,
				line: branch.line,
				node,
				message: `Rama "<<${branch.expr}>>" es una condición imposible (sin valores factibles en 0-100).`,
			});
			continue;
		}

		// Sombreada si cada caja ya está cubierta por alguna rama anterior.
		const covered = region.every((box) =>
			branches.slice(0, i).some((previous, previousIndex) => {
				const previousRegion = regions[previousIndex];
				return Boolean(
					previous.expr && previousRegion?.some((previousBox) => boxContains(previousBox, box)),
				);
			}),
		);
		if (covered) {
			shadowed[i] = true;
			issues.push({
				rule: "conditions:shadowed-branch",
				severity: "error",
				file,
				line: branch.line,
				node,
				message: `Rama "<<${branch.expr}>>" es inalcanzable: todo su rango ya lo cubren ramas anteriores (rama sombreada).`,
			});
		}
	}

	// Solapes entre ramas factibles (el orden decide el resultado en silencio).
	for (let i = 0; i < branches.length; i++) {
		for (let j = i + 1; j < branches.length; j++) {
			if (shadowed[i] || shadowed[j]) continue;
			const regionI = regions[i];
			const regionJ = regions[j];
			if (!regionI || !regionJ) continue;
			if (!branches[i].expr || !branches[j].expr) continue;
			if (boxesOverlap(regionI, regionJ)) {
				issues.push({
					rule: "conditions:overlapping-branches",
					severity: "warning",
					file,
					line: branches[j].line,
					node,
					message: `Ramas "${branches[i].expr}" y "${branches[j].expr}" se solapan: según el orden, un mismo balance cae en la primera.`,
				});
			}
		}
	}
}
