import type { MayaPresence } from "@/entities";

/** Línea de texto lista para renderizar en el chat. */
export interface DialogueLine {
	kind: "line";
	speaker: string | null;
	text: string;
}

/** Bloque de opciones de respuesta para el jugador. */
export interface DialogueOptions {
	kind: "options";
	options: { text: string }[];
}

/** Fin del diálogo. */
export interface DialogueEnd {
	kind: "end";
}

export type DialogueFrame = DialogueLine | DialogueOptions | DialogueEnd;

/** Efectos que los comandos del script aplican sobre el estado del juego. */
export interface DialogueEffects {
	affinity: (delta: number) => void;
	romance: (delta: number) => void;
	trust: (delta: number) => void;
	presence: (presence: MayaPresence) => void;
	typing: (active: boolean) => void;
	photo: (photoId: string) => void;
	/** Notificación push ficticia cuando Maya escribe fuera del chat. */
	notify: (body: string) => void;
	/** Tarjeta de título de capítulo al entrar en una conversación. */
	chapter: (title: string) => void;
	/** Horario de disponibilidad de Maya (para el reloj de juego). */
	availability: (availability: string) => void;
	/** Evento de ausencia: Maya desaparece y vuelve con una ráfaga de fotos. */
	absence: () => void;
	end: () => void;
}

/** Opciones de construcción del engine. */
export interface DialogueEngineOptions {
	script: string;
	startAt?: string;
	variables?: Record<string, unknown>;
	effects: DialogueEffects;
}
