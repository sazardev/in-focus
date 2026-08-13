import { ExpressionEvaluator } from "yarn-spinner-runner-ts";

/**
 * Parche de precedencia del evaluador de `yarn-spinner-runner-ts`.
 *
 * El método original `evaluateExpression` comprueba `containsComparison`
 * ANTES que los operadores lógicos, así que una condición como
 * `$romance >= 70 && $trust >= 70` entra en `evaluateComparison` y el
 * `&&` se ignora (la rama se evalúa mal o siempre cae en la primera).
 *
 * Este parche reenvía las expresiones con `&&`/`||` a una división propia
 * que respeta paréntesis y evalúa cada lado recursivamente.
 */

const originalEvaluateExpression = ExpressionEvaluator.prototype.evaluateExpression;

/** Divide por &&/|| a nivel raíz (fuera de paréntesis), conservando el operador. */
function splitLogical(expr: string): Array<{ text: string; op: "&&" | "||" | null }> {
	const parts: Array<{ text: string; op: "&&" | "||" | null }> = [];
	let depth = 0;
	let current = "";
	let pendingOp: "&&" | "||" | null = null;

	for (let i = 0; i < expr.length; i++) {
		const char = expr[i];
		if (char === "(") depth += 1;
		else if (char === ")") depth = Math.max(0, depth - 1);

		if (depth === 0 && char === "&" && expr[i + 1] === "&") {
			if (current.trim()) {
				parts.push({ text: current.trim(), op: pendingOp });
				current = "";
			}
			pendingOp = "&&";
			i += 1;
			continue;
		}
		if (depth === 0 && char === "|" && expr[i + 1] === "|") {
			if (current.trim()) {
				parts.push({ text: current.trim(), op: pendingOp });
				current = "";
			}
			pendingOp = "||";
			i += 1;
			continue;
		}
		current += char;
	}
	if (current.trim()) {
		parts.push({ text: current.trim(), op: pendingOp });
	}
	return parts;
}

function evaluateWithLogical(this: ExpressionEvaluator, expr: string): unknown {
	const trimmed = expr.trim();
	if (!trimmed.includes("&&") && !trimmed.includes("||")) {
		return originalEvaluateExpression.call(this, expr);
	}

	const parts = splitLogical(trimmed);
	// Sin operadores reales (p. ej. dentro de paréntesis) → evalúa normal.
	if (parts.length <= 1) {
		return originalEvaluateExpression.call(this, expr);
	}

	let result = Boolean(originalEvaluateExpression.call(this, parts[0].text));
	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];
		const value = Boolean(originalEvaluateExpression.call(this, part.text));
		if (part.op === "&&") {
			result = result && value;
		} else if (part.op === "||") {
			result = result || value;
		}
	}
	return result;
}

if (
	!(ExpressionEvaluator.prototype as unknown as { __infocusPatched?: boolean }).__infocusPatched
) {
	ExpressionEvaluator.prototype.evaluateExpression =
		evaluateWithLogical as typeof originalEvaluateExpression;
	(ExpressionEvaluator.prototype as unknown as { __infocusPatched: boolean }).__infocusPatched =
		true;
}
