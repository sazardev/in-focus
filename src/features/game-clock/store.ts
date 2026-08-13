import { create } from "zustand";

/**
 * Configuración del modo acelerado: cada día de juego equivale a
 * `msPerGameDayMs` de tiempo real. Para demo/QA se acelera (por defecto
 * 1 día de juego ≈ 3 minutos); en producción real se usa tiempo real puro.
 */
const ACCELERATION_MS_PER_GAME_DAY = 1000 * 60 * 3;

export interface GameClockState {
	/** Día de juego (empieza en 1). */
	day: number;
	/** Hora del día en juego (0–23). */
	hour: number;
	/** Duración real de un día de juego en ms (modo acelerado). */
	msPerGameDay: number;
	/** Marca de tiempo real del inicio del día de juego actual. */
	dayStartedAt: number;
	/** ¿El reloj está corriendo? */
	running: boolean;
	/** Título del día (p. ej. "Día 1 — El número en la nota"). */
	dayTitle: string | null;
	/** Día de juego de la exposición (null hasta que se anuncia en "El plan"). */
	expoDay: number | null;

	tick: (now?: number) => void;
	start: () => void;
	setDayTitle: (title: string) => void;
	setExpoDay: (day: number) => void;
	reset: () => void;
}

function computeDay(msPerGameDay: number, dayStartedAt: number, now: number): number {
	return Math.max(1, Math.floor((now - dayStartedAt) / msPerGameDay) + 1);
}

function computeHour(msPerGameDay: number, dayStartedAt: number, now: number): number {
	const elapsed = (now - dayStartedAt) % msPerGameDay;
	return Math.floor((elapsed / msPerGameDay) * 24);
}

export const useGameClockStore = create<GameClockState>((set, get) => ({
	day: 1,
	hour: 8,
	msPerGameDay: ACCELERATION_MS_PER_GAME_DAY,
	dayStartedAt: Date.now(),
	running: false,
	dayTitle: null,
	expoDay: null,

	tick: (now = Date.now()) => {
		const { msPerGameDay, dayStartedAt } = get();
		set({
			day: computeDay(msPerGameDay, dayStartedAt, now),
			hour: computeHour(msPerGameDay, dayStartedAt, now),
		});
	},

	start: () => {
		if (get().running) return;
		set({ running: true, dayStartedAt: Date.now() });

		const interval = setInterval(() => {
			const { running, msPerGameDay, dayStartedAt } = get();
			if (!running) {
				clearInterval(interval);
				return;
			}
			const now = Date.now();
			set({
				day: computeDay(msPerGameDay, dayStartedAt, now),
				hour: computeHour(msPerGameDay, dayStartedAt, now),
			});
		}, 60_000);
		// Guardamos el id para poder pararlo en reset.
		(useGameClockStore as unknown as { __interval?: ReturnType<typeof setInterval> }).__interval =
			interval;
	},

	setDayTitle: (title) => set({ dayTitle: title }),

	setExpoDay: (day) => set({ expoDay: day }),

	reset: () => {
		const state = useGameClockStore as unknown as { __interval?: ReturnType<typeof setInterval> };
		if (state.__interval) clearInterval(state.__interval);
		set({
			day: 1,
			hour: 8,
			dayStartedAt: Date.now(),
			running: false,
			dayTitle: null,
			expoDay: null,
		});
	},
}));
