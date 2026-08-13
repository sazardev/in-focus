import { create } from "zustand";

/** Una ventana macOS abierta en el escritorio (laptop). */
export interface MacWindowState {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	z: number;
	minimized: boolean;
	maximized: boolean;
}

interface WindowsState {
	windows: MacWindowState[];
	topZ: number;
	openWindow: (id: string) => void;
	closeWindow: (id: string) => void;
	closeTopWindow: () => void;
	toggleTopWindowMinimize: () => void;
	toggleTopWindowMaximize: () => void;
	focusWindow: (id: string) => void;
	moveWindow: (id: string, x: number, y: number) => void;
	resizeWindow: (id: string, x: number, y: number, w: number, h: number) => void;
	toggleMinimize: (id: string) => void;
	toggleMaximize: (id: string) => void;
}

/** La ventana al frente (mayor z). */
function topWindow(windows: MacWindowState[]): MacWindowState | undefined {
	return [...windows].sort((a, b) => b.z - a.z)[0];
}

let cascade = 0;

const TITLEBAR_H = 34;
const TITLEBAR_VISIBLE = 24;
const EDGE_VISIBLE = 120;

/**
 * Limita la posición de una ventana para que nunca quede fuera de la vista:
 * siempre queda un trozo de la barra de título (TITLEBAR_VISIBLE) para poder
 * volver a arrastrarla, y al menos EDGE_VISIBLE px horizontales visibles.
 */
function clampPosition(x: number, y: number, w: number): { x: number; y: number } {
	const viewportW = window.innerWidth;
	const viewportH = window.innerHeight;
	const minX = Math.min(0, EDGE_VISIBLE - w);
	const maxX = Math.max(minX, viewportW - EDGE_VISIBLE);
	const minY = Math.min(0, TITLEBAR_VISIBLE - TITLEBAR_H);
	const maxY = Math.max(minY, viewportH - TITLEBAR_VISIBLE);
	return {
		x: Math.min(maxX, Math.max(minX, x)),
		y: Math.min(maxY, Math.max(minY, y)),
	};
}

export const useWindowsStore = create<WindowsState>((set, get) => ({
	windows: [],
	topZ: 10,

	openWindow: (id) => {
		const existing = get().windows.find((window) => window.id === id);
		if (existing) {
			// Ya abierta: restaura y trae al frente.
			set({
				windows: get().windows.map((window) =>
					window.id === id ? { ...window, minimized: false, z: get().topZ + 1 } : window,
				),
				topZ: get().topZ + 1,
			});
			return;
		}
		cascade += 1;
		const offset = (cascade % 6) * 30;
		set({
			windows: [
				...get().windows,
				{
					id,
					x: 70 + offset,
					y: 40 + offset,
					w: 440,
					h: 540,
					z: get().topZ + 1,
					minimized: false,
					maximized: false,
				},
			],
			topZ: get().topZ + 1,
		});
	},

	closeWindow: (id) => set({ windows: get().windows.filter((window) => window.id !== id) }),

	closeTopWindow: () => {
		const top = topWindow(get().windows);
		if (top) set({ windows: get().windows.filter((window) => window.id !== top.id) });
	},

	toggleTopWindowMinimize: () => {
		const top = topWindow(get().windows);
		if (top) {
			set({
				windows: get().windows.map((window) =>
					window.id === top.id ? { ...window, minimized: !window.minimized } : window,
				),
			});
		}
	},

	toggleTopWindowMaximize: () => {
		const top = topWindow(get().windows);
		if (top) {
			set({
				windows: get().windows.map((window) =>
					window.id === top.id ? { ...window, maximized: !window.maximized } : window,
				),
			});
		}
	},

	focusWindow: (id) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id ? { ...window, z: get().topZ + 1 } : window,
			),
			topZ: get().topZ + 1,
		}),

	moveWindow: (id, x, y) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id ? { ...window, ...clampPosition(x, y, window.w) } : window,
			),
		}),

	resizeWindow: (id, x, y, w, h) => {
		const width = Math.max(300, Math.round(w));
		const height = Math.max(240, Math.round(h));
		return set({
			windows: get().windows.map((window) =>
				window.id === id
					? { ...window, ...clampPosition(x, y, width), w: width, h: height }
					: window,
			),
		});
	},

	toggleMinimize: (id) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id ? { ...window, minimized: !window.minimized } : window,
			),
		}),

	toggleMaximize: (id) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id ? { ...window, maximized: !window.maximized } : window,
			),
		}),
}));
