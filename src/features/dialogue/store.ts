import { create } from "zustand";
import type { Message } from "@/entities";
import { useAbsenceStore } from "@/features/absence/store";
import { useChatStore } from "@/features/chat/store";
import { calculateReadDelay } from "@/features/fake-typing/delay";
import { useFakeTypingStore } from "@/features/fake-typing/store";
import { useGalleryStore } from "@/features/gallery/store";
import { useGameClockStore } from "@/features/game-clock";
import { useNotificationsStore } from "@/features/notifications";
import { useProfileStore } from "@/features/profile/store";
import { useRelationshipStore } from "@/features/relationship";
import { playSend } from "@/shared/sound";
import { DialogueEngine } from "./engine";
import { resolvePhotoUrl } from "./photos";
import { buildChapterScript } from "./scripts";
import type { DialogueFrame } from "./types";

interface DialogueOption {
	text: string;
}

interface PendingOption {
	index: number;
	text: string;
}

/** Decisión registrada para el panel "Historia" (opciones elegidas). */
export interface DialogueChoice {
	id: string;
	chapter: number;
	option: string;
}

const CHOICES_KEY = "in-focus:choices";
let choiceSeq = 0;

function loadChoices(): DialogueChoice[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(CHOICES_KEY);
		return raw ? (JSON.parse(raw) as DialogueChoice[]) : [];
	} catch {
		return [];
	}
}

function saveChoices(choices: DialogueChoice[]): void {
	try {
		localStorage.setItem(CHOICES_KEY, JSON.stringify(choices));
	} catch {
		// almacenamiento no disponible: el diario de decisiones se pierde
	}
}

interface DialogueState {
	started: boolean;
	finished: boolean;
	options: DialogueOption[] | null;
	pendingOption: PendingOption | null;
	currentNode: string;
	/** Variables del script Yarn (flags de capítulo, contadores, ejes). */
	scriptVariables: Record<string, unknown>;
	/**
	 * Historial de elecciones del jugador (índices de opción elegidos, en
	 * orden). Permite reanudar la partida reproduciendo el diálogo en
	 * silencio hasta el punto exacto (resume determinista).
	 */
	choiceHistory: number[];
	/** Decisiones con texto, para el panel "Historia" (persistido en local). */
	choiceLog: DialogueChoice[];
	start: () => void;
	chooseOption: (index: number) => void;
	confirmSend: () => void;
	cancelTyping: () => void;
	reset: () => void;
}

let engine: DialogueEngine | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let messageSeq = 0;

/** Restaura el contador de ids a partir de mensajes ya persistidos. */
export function syncMessageSeq(messages: Message[]): void {
	let max = 0;
	for (const message of messages) {
		const match = /^msg-(\d+)$/.exec(message.id);
		if (match) max = Math.max(max, Number(match[1]));
	}
	messageSeq = max;
}

function newId(): string {
	messageSeq += 1;
	return `msg-${messageSeq}`;
}

/** Guarda las variables del engine en el store para persistencia. */
function syncVariables(): void {
	if (engine) {
		useDialogueStore.setState({ scriptVariables: engine.getVariables() });
	}
}

function enqueue(fn: () => void, ms: number): void {
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => {
		timer = null;
		fn();
	}, ms);
}

function toIncomingMessage(text: string): Message {
	return {
		id: newId(),
		author: "maya",
		content: { kind: "text", text },
		sentAt: Date.now(),
		status: "read",
	};
}

function toOutgoingMessage(text: string): Message {
	return {
		id: newId(),
		author: "player",
		content: { kind: "text", text },
		sentAt: Date.now(),
		status: "read",
	};
}

function toPhotoMessage(photoId: string): Message | null {
	const photoUrl = resolvePhotoUrl(photoId);
	if (!photoUrl) return null;
	return {
		id: newId(),
		author: "maya",
		content: { kind: "photo", photoId: photoUrl },
		sentAt: Date.now(),
		status: "read",
	};
}

/** Guarda la foto en la galería (coleccionables de progreso). */
function collectPhoto(photoId: string, messageId: string): void {
	const photoUrl = resolvePhotoUrl(photoId);
	if (!photoUrl) return;
	useGalleryStore.getState().addPhoto({
		id: photoId,
		sourcePath: photoUrl,
		takenAt: Date.now(),
		unlocked: true,
	});
	void messageId;
}

/** Dirige un frame del engine hacia el chat y decide cuándo avanzar. */
function processFrame(frame: DialogueFrame): void {
	const chat = useChatStore.getState();

	if (frame.kind === "end") {
		useDialogueStore.setState({ finished: true, options: null });
		chat.setMayaTyping(false);
		return;
	}

	if (frame.kind === "options") {
		useDialogueStore.setState({ options: frame.options });
		return;
	}

	// Línea de texto: simula el tecleo de Maya antes de mostrarla.
	chat.setMayaTyping(true);
	const typingMs = calculateReadDelay(frame.text.length, 1200, 10000, frame.text);

	enqueue(() => {
		chat.setMayaTyping(false);
		const message =
			frame.speaker && frame.speaker.toLowerCase() === "player"
				? toOutgoingMessage(frame.text)
				: toIncomingMessage(frame.text);
		chat.appendMessage(message);

		enqueue(
			() => {
				if (engine) {
					const next = engine.advance();
					if (engine) {
						useDialogueStore.setState({ currentNode: engine.getCurrentNodeTitle() });
					}
					syncVariables();
					processFrame(next);
				}
			},
			600 + Math.random() * 700,
		);
	}, typingMs);
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
	started: false,
	finished: false,
	options: null,
	pendingOption: null,
	currentNode: "Start",
	scriptVariables: {},
	choiceHistory: [],
	choiceLog: loadChoices(),

	start: () => {
		if (engine) {
			engine = null;
			if (timer) clearTimeout(timer);
			timer = null;
		}
		useFakeTypingStore.getState().reset();

		const relationship = useRelationshipStore.getState();
		const chat = useChatStore.getState();
		const profile = useProfileStore.getState().profile;
		const notifications = useNotificationsStore.getState();
		const savedVariables = get().scriptVariables;
		const choiceHistory = get().choiceHistory;
		const isResume = choiceHistory.length > 0;

		// Durante la reproducción del historial no se aplican efectos
		// (fotos, ausencias, deltas): el estado ya está persistido.
		let replaying = isResume;

		engine = new DialogueEngine({
			script: buildChapterScript(),
			variables: {
				affinity: relationship.affinity,
				romance: relationship.romance,
				trust: relationship.trust,
				player_name: profile?.name ?? "Tú",
				pronouns: profile?.pronouns ?? "neutral",
				...savedVariables,
			},
			effects: {
				affinity: (delta) => {
					if (!replaying) useRelationshipStore.getState().addDelta("affinity", delta);
				},
				romance: (delta) => {
					if (!replaying) useRelationshipStore.getState().addDelta("romance", delta);
				},
				trust: (delta) => {
					if (!replaying) useRelationshipStore.getState().addDelta("trust", delta);
				},
				presence: (presence) => {
					if (!replaying) chat.setMayaPresence(presence);
				},
				typing: (active) => {
					if (!replaying) chat.setMayaTyping(active);
				},
				photo: (photoId) => {
					if (replaying) return;
					const photoMessage = toPhotoMessage(photoId);
					if (photoMessage) {
						chat.appendMessage(photoMessage);
						collectPhoto(photoId, photoMessage.id);
					}
				},
				notify: (body) => {
					if (!replaying) notifications.push({ title: "Maya 📸", body });
				},
				chapter: (title) => {
					if (replaying) return;
					chat.setChapterTitle(title);
					useGameClockStore.getState().setDayTitle(title);
					// "El plan" anuncia la exposición (el sábado): arranca el contador.
					if (title === "El plan") {
						const clock = useGameClockStore.getState();
						if (clock.expoDay == null) clock.setExpoDay(clock.day + 3);
					}
				},
				availability: (availability) => {
					if (!replaying) chat.setMayaAvailability(availability);
				},
				absence: () => {
					if (replaying) return;
					useAbsenceStore.getState().beginAbsence({
						durationMs: 5000,
						burst: {
							texts: [
								"¡VOLVÍ!",
								"Perdón por desaparecer, la luz estaba perfecta",
								"Te tengo una sorpresa...",
							],
							photos: ["atardecer", "neon", "luz"],
						},
					});
				},
				end: () => {
					if (!replaying) set({ finished: true });
				},
			},
		});

		// Resume determinista: reproducir en silencio las elecciones previas
		// hasta llegar al punto exacto de la partida guardada.
		if (isResume) {
			let guard = 0;
			let historyIndex = 0;
			while (engine && guard++ < 10_000 && historyIndex < choiceHistory.length) {
				if (engine.current.kind === "options") {
					const optionIndex = choiceHistory[historyIndex];
					historyIndex += 1;
					engine.advance(optionIndex);
				} else if (engine.current.kind === "line") {
					engine.advance();
				} else {
					break;
				}
			}

			// Salta en silencio las líneas de Maya que ya están en el historial
			// (p. ej. respuestas a la última elección ya visibles al guardar).
			const seenTexts = new Set(
				chat.messages
					.filter((m) => m.author === "maya" && m.content.kind === "text")
					.map((m) => (m.content.kind === "text" ? m.content.text : "")),
			);
			let skipGuard = 0;
			while (
				engine &&
				engine.current.kind === "line" &&
				seenTexts.has(engine.current.text) &&
				skipGuard++ < 100
			) {
				engine.advance();
			}

			replaying = false;
			if (engine) {
				useDialogueStore.setState({
					currentNode: engine.getCurrentNodeTitle(),
					scriptVariables: engine.getVariables(),
				});
			}
		}

		set({
			started: true,
			finished: false,
			options: null,
			pendingOption: null,
			scriptVariables: engine?.getVariables() ?? savedVariables,
		});
		useGameClockStore.getState().start();
		if (engine) processFrame(engine.current);
	},

	/**
	 * El jugador elige una opción de respuesta: oculta las opciones, bloquea
	 * el chat y activa el teclado falso con el texto predefinido.
	 */
	chooseOption: (index) => {
		const current = get();
		const option = current.options?.[index];
		if (!option || !engine) return;

		useFakeTypingStore.getState().startTyping(option.text);
		set({ options: null, pendingOption: { index, text: option.text } });
	},

	/**
	 * Se llama cuando el teclado falso completó el texto y el jugador pulsa
	 * enviar: manda el mensaje saliente y continúa el diálogo.
	 */
	confirmSend: () => {
		const pending = get().pendingOption;
		if (!pending || !engine) return;

		useChatStore.getState().appendMessage(toOutgoingMessage(pending.text));
		useChatStore.getState().setMayaTyping(false);
		useFakeTypingStore.getState().reset();
		playSend();
		const choiceHistory = [...get().choiceHistory, pending.index];
		const chapterMatch = /^Cap(\d+)/.exec(get().currentNode);
		choiceSeq += 1;
		const choiceLog = [
			...get().choiceLog,
			{
				id: `c-${Date.now()}-${choiceSeq}`,
				chapter: chapterMatch ? Number(chapterMatch[1]) : 0,
				option: pending.text,
			},
		];
		saveChoices(choiceLog);
		set({ pendingOption: null, choiceHistory, choiceLog });

		const next = engine.advance(pending.index);
		if (engine) {
			useDialogueStore.setState({ currentNode: engine.getCurrentNodeTitle() });
		}
		syncVariables();
		processFrame(next);
	},

	/** Cancela el teclado falso y vuelve a mostrar las opciones. */
	cancelTyping: () => {
		if (!get().pendingOption) return;
		useFakeTypingStore.getState().reset();
		set({ pendingOption: null, options: [] });
	},

	reset: () => {
		engine = null;
		if (timer) clearTimeout(timer);
		timer = null;
		useChatStore.setState({
			messages: [],
			isMayaTyping: false,
			chapterTitle: null,
			mayaAvailability: null,
		});
		useFakeTypingStore.getState().reset();
		useGameClockStore.getState().reset();
		saveChoices([]);
		set({
			started: false,
			finished: false,
			options: null,
			pendingOption: null,
			currentNode: "Start",
			scriptVariables: {},
			choiceHistory: [],
			choiceLog: [],
		});
	},
}));
