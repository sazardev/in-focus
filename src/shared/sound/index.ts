import { create } from "zustand";

const SOUND_KEY = "in-focus:sound";

/**
 * Preferencia de sonido (persistida en localStorage, como el tema).
 */
interface SoundState {
	enabled: boolean;
	setEnabled: (enabled: boolean) => void;
	toggleSound: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
	enabled: typeof window === "undefined" ? true : localStorage.getItem(SOUND_KEY) !== "off",
	setEnabled: (enabled) => {
		localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
		set({ enabled });
	},
	toggleSound: () => get().setEnabled(!get().enabled),
}));

/* ════════════ Sintetizador (Web Audio API) ════════════
   Sonidos generados en tiempo real, sin assets binarios: funcionan en el
   navegador y dentro del webview de Tauri. */

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const Ctor =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
	}
	if (ctx.state === "suspended") void ctx.resume();
	return ctx;
}

/** Tono con envolvente de volumen (ataque/decaimiento suave). */
function tone(
	ac: AudioContext,
	freq: number,
	delay: number,
	duration: number,
	volume: number,
	type: OscillatorType = "sine",
): void {
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	const t0 = ac.currentTime + delay;
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	gain.gain.setValueAtTime(0.0001, t0);
	gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
	osc.connect(gain).connect(ac.destination);
	osc.start(t0);
	osc.stop(t0 + duration + 0.05);
}

/** Notificación push: "ding" de dos notas. */
export function playNotification(): void {
	const ac = audioContext();
	if (!ac || !useSoundStore.getState().enabled) return;
	tone(ac, 880, 0, 0.18, 0.11);
	tone(ac, 1320, 0.09, 0.24, 0.09);
}

/** Maya empieza a escribir: "tick" corto y suave. */
export function playTyping(): void {
	const ac = audioContext();
	if (!ac || !useSoundStore.getState().enabled) return;
	tone(ac, 520, 0, 0.05, 0.045, "triangle");
}

/** El jugador envía un mensaje: "chirp" ascendente. */
export function playSend(): void {
	const ac = audioContext();
	if (!ac || !useSoundStore.getState().enabled) return;
	tone(ac, 660, 0, 0.07, 0.08);
	tone(ac, 880, 0.05, 0.11, 0.08);
}

/** Llega una foto / se desbloquea en la galería: "blip" brillante. */
export function playPhoto(): void {
	const ac = audioContext();
	if (!ac || !useSoundStore.getState().enabled) return;
	tone(ac, 1046, 0, 0.09, 0.09);
	tone(ac, 1568, 0.07, 0.16, 0.08);
}
