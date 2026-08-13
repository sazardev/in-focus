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
	focusWindow: (id: string) => void;
	moveWindow: (id: string, x: number, y: number) => void;
	resizeWindow: (id: string, x: number, y: number, w: number, h: number) => void;
	toggleMinimize: (id: string) => void;
	toggleMaximize: (id: string) => void;
}

let cascade = 0;

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

	focusWindow: (id) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id ? { ...window, z: get().topZ + 1 } : window,
			),
			topZ: get().topZ + 1,
		}),

	moveWindow: (id, x, y) =>
		set({
			windows: get().windows.map((window) => (window.id === id ? { ...window, x, y } : window)),
		}),

	resizeWindow: (id, x, y, w, h) =>
		set({
			windows: get().windows.map((window) =>
				window.id === id
					? {
							...window,
							x,
							y,
							w: Math.max(300, Math.round(w)),
							h: Math.max(240, Math.round(h)),
						}
					: window,
			),
		}),

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
