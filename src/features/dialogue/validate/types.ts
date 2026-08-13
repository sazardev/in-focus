/**
 * Tipos del motor de validación de scripts `.yarn`.
 *
 * El motor escanea los capítulos (STORY.md §9) y reporta fugas de texto,
 * decisiones, puntos, variables y condiciones para que el script nunca se
 * salga del diseño: una línea que no debería renderizarse, una decisión sin
 * cuerpo o sin consecuencias, un delta fuera de rango, una variable no
 * declarada o una rama de final que jamás se alcanza.
 */

export type Severity = "error" | "warning";

export type RuleId =
	// Fugas de texto
	| "text:empty-line"
	| "text:unknown-speaker"
	| "text:unresolved-interpolation"
	| "text:duplicate-line"
	// Fugas de decisiones
	| "decisions:single-option"
	| "decisions:too-many-options"
	| "decisions:duplicate-option"
	| "decisions:empty-option"
	| "decisions:no-consequence"
	// Fugas de puntos
	| "points:invalid-delta"
	| "points:zero-delta"
	| "points:delta-overflow"
	| "points:direct-set-axis"
	| "points:in-condition"
	// Fugas de variables
	| "variables:undeclared"
	| "variables:declared-unused"
	| "variables:set-never-read"
	// Fugas de condiciones
	| "conditions:empty"
	| "conditions:threshold-out-of-range"
	| "conditions:shadowed-branch"
	| "conditions:overlapping-branches"
	| "conditions:final-infeasible"
	// Fugas estructurales
	| "structure:parse-error"
	| "structure:duplicate-node"
	| "structure:broken-jump"
	| "structure:unreachable-node"
	| "structure:cycle"
	| "structure:no-termination"
	| "structure:invalid-photo"
	| "structure:once-block"
	| "structure:missing-end-flag"
	| "structure:flag-after-jump"
	| "structure:missing-next-jump"
	| "structure:missing-fin"
	| "structure:node-naming"
	// Fugas de decisiones (avanzadas)
	| "decisions:dead-option"
	// Fugas de flujo de variables
	| "variables:read-before-declare"
	| "variables:type-mismatch"
	// Fugas de cumplimiento narrativo (STORY.md)
	| "story:min-mechanics"
	| "story:line-too-long"
	| "story:average-line-length"
	| "story:pronouns-unused"
	| "story:unused-photo";

/** Fuente de un capítulo listo para validar. */
export interface SourceFile {
	/** Nombre del archivo (p. ej. `07-sesion-azotea.yarn`). */
	file: string;
	source: string;
}

/** Un hallazgo del motor. */
export interface ValidationIssue {
	rule: RuleId;
	severity: Severity;
	file: string;
	/** Número de línea (1-based) o null cuando el origen es global. */
	line: number | null;
	/** Nodo Yarn implicado, cuando se conoce. */
	node: string | null;
	message: string;
}

/** Resultado agregado de la validación. */
export interface ValidationReport {
	issues: ValidationIssue[];
	errors: number;
	warnings: number;
	/** true si no hay ningún error (los warnings no bloquean). */
	ok: boolean;
}
