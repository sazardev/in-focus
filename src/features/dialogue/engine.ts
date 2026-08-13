import { compile, parseCommand, parseYarn, YarnRunner } from "yarn-spinner-runner-ts";
import type { MayaPresence } from "@/entities";
import type { DialogueEffects, DialogueEngineOptions, DialogueFrame } from "./types";
import "./evaluator-patch";

function parsePresence(value: string): MayaPresence | null {
	const normalized = value.trim().toLowerCase();
	if (normalized === "online") return "online";
	if (normalized === "offline") return "offline";
	if (normalized === "taking-photos") return "taking-photos";
	return null;
}

/** Quita las comillas que `parseCommand` conserva en los args (p. ej. <<chapter "Título">>). */
function unquote(value: string): string {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

/**
 * Envuelve el runtime de Yarn Spinner (yarn-spinner-runner-ts) para el chat.
 *
 * - Compila el script `.yarn` una sola vez.
 * - Traduce los resultados del runner a frames digeribles (línea / opciones / fin).
 * - Salta automáticamente los resultados `command` (ya aplicados como efectos).
 */
export class DialogueEngine {
	private readonly runner: YarnRunner;
	private readonly effects: DialogueEffects;

	constructor(options: DialogueEngineOptions) {
		this.effects = options.effects;

		const document = parseYarn(options.script);
		const program = compile(document);

		this.runner = new YarnRunner(program, {
			startAt: options.startAt ?? "Start",
			variables: options.variables,
			handleCommand: (raw) => this.handleCommand(raw),
		});

		// El constructor del runner ya emite el primer resultado; lo normalizamos.
		this.current = this.normalize();
	}

	/** Procesa un comando del script: efectos del juego + sincronización de variables. */
	private handleCommand(raw: string): void {
		let parsed: ReturnType<typeof parseCommand>;
		try {
			parsed = parseCommand(raw);
		} catch {
			return;
		}

		switch (parsed.name) {
			case "affinity":
			case "romance":
			case "trust": {
				const delta = Number(parsed.args[0]);
				if (!Number.isFinite(delta)) break;
				// Mantiene $affinity/$romance/$trust del script en sincronía
				// con los medidores externos del store multieje.
				const variableName = parsed.name;
				const current = Number(this.runner.getVariable(variableName) ?? 0);
				this.runner.setVariable(variableName, current + delta);
				this.effects[parsed.name](delta);
				break;
			}
			case "presence": {
				const presence = parsePresence(parsed.args[0] ?? "");
				if (presence) this.effects.presence(presence);
				break;
			}
			case "typing": {
				this.effects.typing(parsed.args[0] === "true");
				break;
			}
			case "photo": {
				const photoId = parsed.args[0];
				if (photoId) this.effects.photo(photoId);
				break;
			}
			case "notify": {
				const body = parsed.args[0];
				if (body) this.effects.notify(unquote(body));
				break;
			}
			case "chapter": {
				const title = parsed.args[0];
				if (title) this.effects.chapter(unquote(title));
				break;
			}
			case "availability": {
				const availability = parsed.args[0];
				if (availability) this.effects.availability(unquote(availability));
				break;
			}
			case "absence": {
				this.effects.absence();
				break;
			}
			case "fin": {
				this.effects.end();
				break;
			}
			default:
				break;
		}
	}

	/** Frame actual listo para renderizar. */
	current: DialogueFrame;

	/**
	 * Avanza el diálogo (desde una línea o, con `optionIndex`, desde unas opciones).
	 * `optionIndex` es obligatorio cuando el frame actual es `options`.
	 */
	advance(optionIndex?: number): DialogueFrame {
		if (this.current.kind === "options") {
			if (optionIndex === undefined) {
				throw new Error("optionIndex required to advance from options");
			}
			this.runner.advance(optionIndex);
		} else if (this.current.kind === "end") {
			throw new Error("dialogue already finished");
		} else {
			this.runner.advance();
		}

		this.current = this.normalize();
		return this.current;
	}

	/** Lee las variables del runner (estado del juego). */
	getVariables(): Readonly<Record<string, unknown>> {
		return this.runner.getVariables();
	}

	/** Título del nodo actual (útil para guardar progreso por nodo). */
	getCurrentNodeTitle(): string {
		return this.runner.getCurrentNodeTitle();
	}

	private normalize(): DialogueFrame {
		let result = this.runner.currentResult;
		let guard = 0;

		// Los comandos ya fueron aplicados como efectos por handleCommand;
		// los saltamos hasta llegar a una línea, unas opciones o el final.
		while (result && result.type === "command" && guard++ < 100) {
			this.runner.advance();
			result = this.runner.currentResult;
		}

		if (!result) {
			this.effects.end();
			return { kind: "end" };
		}

		if (result.type === "options") {
			return {
				kind: "options",
				options: result.options.map((option) => ({ text: option.text })),
			};
		}

		const textResult = result as Extract<typeof result, { type: "text" }>;

		// El runner marca la última línea con isDialogueEnd=true pero aún hay
		// que mostrarla; solo el marcador terminal (texto vacío) es el fin.
		if (textResult.isDialogueEnd && textResult.text === "") {
			this.effects.end();
			return { kind: "end" };
		}

		return {
			kind: "line",
			speaker: textResult.speaker ?? null,
			text: textResult.text,
		};
	}
}
