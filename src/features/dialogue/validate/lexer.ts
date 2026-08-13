/**
 * Escaneo léxico de un archivo `.yarn`, línea por línea.
 *
 * El AST de `yarn-spinner-runner-ts` no expone posiciones de línea, así que
 * este lexer re-lleva la cuenta: nodos, `<<declare>>`, `<<set>>`, lecturas
 * de variables (condiciones e interpolaciones), saltos, deltas, opciones,
 * comandos y líneas de diálogo, todos con su número de línea y su sangrado
 * para saber a qué opción o bloque `<<if>>` pertenecen.
 */

import type { SourceFile } from "./types";

export interface NodeRef {
	title: string;
	line: number;
}

export interface NodeRange {
	title: string;
	startLine: number;
	endLine: number;
}

export interface DeclareToken {
	name: string;
	line: number;
	value: string;
}

export interface SetToken {
	name: string;
	line: number;
	indent: number;
	value: string;
}

export interface ReadToken {
	name: string;
	line: number;
	source: "condition" | "interpolation" | "option-condition";
}

export interface JumpToken {
	target: string;
	line: number;
}

export interface DeltaToken {
	axis: "affinity" | "romance" | "trust";
	delta: number;
	line: number;
	insideIf: boolean;
}

export interface OptionToken {
	text: string;
	line: number;
	indent: number;
	condition: string | null;
	/** Id del bloque de opciones contiguo al que pertenece. */
	group: number;
	/** La opción contiene al menos un comando de delta. */
	hasDelta: boolean;
	/** Otros comandos de efecto dentro de la opción. */
	effects: string[];
	/** Número de líneas de diálogo dentro del cuerpo de la opción. */
	bodyLines: number;
}

export interface IfToken {
	expr: string;
	line: number;
	kind: "if" | "elseif" | "else";
}

export interface DialogueToken {
	speaker: string | null;
	text: string;
	line: number;
	indent: number;
	node: string;
}

export interface CommandToken {
	name: string;
	raw: string;
	line: number;
	indent: number;
}

export interface PhotoToken {
	id: string;
	line: number;
}

export interface LexedFile {
	file: string;
	nodes: NodeRef[];
	nodeRanges: NodeRange[];
	declares: DeclareToken[];
	sets: SetToken[];
	reads: ReadToken[];
	jumps: JumpToken[];
	deltas: DeltaToken[];
	options: OptionToken[];
	ifs: IfToken[];
	dialogue: DialogueToken[];
	photos: PhotoToken[];
	commands: CommandToken[];
	onceLines: number[];
}

export const AXES = ["affinity", "romance", "trust"] as const;
export type Axis = (typeof AXES)[number];

/** Variables inyectadas por la app en tiempo de ejecución (no declaradas en Yarn). */
export const RUNTIME_VARS = new Set(["player_name", "pronouns"]);

const AXIS_SET = new Set<string>(AXES);

function indentOf(line: string): number {
	let n = 0;
	while (n < line.length && (line[n] === " " || line[n] === "\t")) n += 1;
	return n;
}

/** Recoge los `$var` referenciados en una expresión. */
function collectVars(
	expr: string,
	readSource: ReadToken["source"],
	line: number,
	reads: ReadToken[],
): void {
	const re = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
	let match = re.exec(expr);
	while (match) {
		reads.push({ name: match[1], line, source: readSource });
		match = re.exec(expr);
	}
}

export function lexFile(sourceFile: SourceFile): LexedFile {
	const file = sourceFile.file;
	const lexed: LexedFile = {
		file,
		nodes: [],
		nodeRanges: [],
		declares: [],
		sets: [],
		reads: [],
		jumps: [],
		deltas: [],
		options: [],
		ifs: [],
		dialogue: [],
		photos: [],
		commands: [],
		onceLines: [],
	};

	const lines = sourceFile.source.split("\n");
	let inBody = false;
	let currentNode: string | null = null;
	let currentNodeStart = 0;
	const ifStack: number[] = [];
	let currentOption: OptionToken | null = null;
	let optionGroup = 0;

	const closeOptionIfShallower = (indent: number): void => {
		if (currentOption && indent <= currentOption.indent) currentOption = null;
	};

	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i].replace(/\r$/, "");
		const lineNumber = i + 1;
		const trimmed = raw.trim();
		const indent = indentOf(raw);

		if (trimmed === "") continue;

		if (!inBody) {
			const titleMatch = /^title:\s*(.+)$/.exec(trimmed);
			if (titleMatch) {
				const title = titleMatch[1].trim();
				if (currentNode) {
					lexed.nodeRanges.push({
						title: currentNode,
						startLine: currentNodeStart,
						endLine: lineNumber - 1,
					});
				}
				currentNode = title;
				currentNodeStart = lineNumber;
				lexed.nodes.push({ title, line: lineNumber });
			}
			if (trimmed === "---") inBody = true;
			continue;
		}

		if (trimmed === "===") {
			inBody = false;
			currentOption = null;
			if (currentNode) {
				lexed.nodeRanges.push({
					title: currentNode,
					startLine: currentNodeStart,
					endLine: lineNumber,
				});
			}
			currentNode = null;
			continue;
		}

		// Opción (decisión del jugador).
		const optionMatch = /^->\s+(.+)$/.exec(trimmed);
		if (optionMatch) {
			// Mismo bloque si la opción anterior sigue abierta (misma indentación).
			const sameBlock = currentOption !== null;
			closeOptionIfShallower(indent);
			if (!sameBlock) optionGroup += 1;
			const rawText = optionMatch[1];
			const conditionMatch = /^(.*?)\s*\[if\s+(.*?)\]$/.exec(rawText);
			const option: OptionToken = {
				text: conditionMatch ? conditionMatch[1].trim() : rawText,
				line: lineNumber,
				indent,
				group: optionGroup,
				condition: conditionMatch ? conditionMatch[2].trim() : null,
				hasDelta: false,
				effects: [],
				bodyLines: 0,
			};
			lexed.options.push(option);
			currentOption = option;
			if (option.condition)
				collectVars(option.condition, "option-condition", lineNumber, lexed.reads);
			continue;
		}

		// Comando `<<...>>`.
		const commandMatch = /^<<(.+?)>>$/.exec(trimmed);
		if (commandMatch) {
			closeOptionIfShallower(indent);
			const content = commandMatch[1];
			const cmdName = (content.split(/\s+/, 1)[0] ?? "").toLowerCase();
			lexed.commands.push({ name: cmdName, raw: content, line: lineNumber, indent });

			switch (cmdName) {
				case "declare": {
					const decl = /^\$\s?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/.exec(
						content.slice("declare".length).trim(),
					);
					if (decl) {
						lexed.declares.push({ name: decl[1], line: lineNumber, value: decl[2].trim() });
					}
					break;
				}
				case "set": {
					const set = /^\$\s?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/.exec(
						content.slice("set".length).trim(),
					);
					if (set) {
						lexed.sets.push({ name: set[1], line: lineNumber, indent, value: set[2].trim() });
					}
					break;
				}
				case "if":
				case "elseif": {
					const expr = content.slice(cmdName.length).trim();
					if (cmdName === "if") ifStack.push(indent);
					lexed.ifs.push({ expr, line: lineNumber, kind: cmdName });
					collectVars(expr, "condition", lineNumber, lexed.reads);
					break;
				}
				case "else": {
					lexed.ifs.push({ expr: "", line: lineNumber, kind: "else" });
					break;
				}
				case "endif": {
					while (ifStack.length > 0 && ifStack[ifStack.length - 1] >= indent) ifStack.pop();
					break;
				}
				case "once": {
					lexed.onceLines.push(lineNumber);
					break;
				}
				case "endonce": {
					break;
				}
				case "jump": {
					const jump = /^jump\s+([A-Za-z_][\w.]*)/.exec(content);
					if (jump) lexed.jumps.push({ target: jump[1], line: lineNumber });
					break;
				}
				case "detour": {
					const detour = /^detour\s+([A-Za-z_][\w.]*)/.exec(content);
					if (detour) lexed.jumps.push({ target: detour[1], line: lineNumber });
					break;
				}
				case "photo": {
					const photo = /^photo\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(content);
					if (photo) lexed.photos.push({ id: photo[1], line: lineNumber });
					break;
				}
				case "affinity":
				case "romance":
				case "trust": {
					const arg = content.slice(cmdName.length).trim();
					const delta = arg === "" ? Number.NaN : Number(arg);
					const insideIf = ifStack.some((ifIndent) => indent > ifIndent);
					lexed.deltas.push({
						axis: cmdName as Axis,
						delta: Number.isFinite(delta) ? delta : Number.NaN,
						line: lineNumber,
						insideIf,
					});
					if (currentOption) {
						currentOption.hasDelta = true;
						if (insideIf) currentOption.effects.push(`${cmdName}(cond)`);
					}
					break;
				}
				default: {
					if (currentOption) currentOption.effects.push(cmdName);
					break;
				}
			}
			continue;
		}

		// Línea de diálogo.
		closeOptionIfShallower(indent);
		let speaker: string | null = null;
		let text = trimmed;
		const speakerMatch = /^([A-Za-z][A-Za-z0-9_\u00C0-\u00FF]*):\s?(.*)$/.exec(trimmed);
		if (speakerMatch) {
			speaker = speakerMatch[1];
			text = speakerMatch[2];
		}

		const interpolationRe = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
		let interpolationMatch = interpolationRe.exec(text);
		while (interpolationMatch) {
			lexed.reads.push({
				name: interpolationMatch[1],
				line: lineNumber,
				source: "interpolation",
			});
			interpolationMatch = interpolationRe.exec(text);
		}

		if (currentOption) currentOption.bodyLines += 1;
		lexed.dialogue.push({
			speaker,
			text,
			line: lineNumber,
			indent,
			node: currentNode ?? "",
		});
	}

	if (currentNode) {
		lexed.nodeRanges.push({
			title: currentNode,
			startLine: currentNodeStart,
			endLine: lines.length,
		});
	}

	return lexed;
}

export function isAxis(name: string): boolean {
	return AXIS_SET.has(name);
}
