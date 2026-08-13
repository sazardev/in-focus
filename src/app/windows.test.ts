import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "./windows";

describe("windows store (macOS)", () => {
	beforeEach(() => {
		useWindowsStore.setState({ windows: [], topZ: 10 });
	});

	it("abre una ventana y la trae al frente si ya existe", () => {
		useWindowsStore.getState().openWindow("chat");
		expect(useWindowsStore.getState().windows).toHaveLength(1);
		const firstZ = useWindowsStore.getState().windows[0].z;

		useWindowsStore.getState().openWindow("chat");
		expect(useWindowsStore.getState().windows).toHaveLength(1);
		expect(useWindowsStore.getState().windows[0].z).toBeGreaterThan(firstZ);
	});

	it("cierra una ventana", () => {
		useWindowsStore.getState().openWindow("music");
		useWindowsStore.getState().openWindow("notes");
		useWindowsStore.getState().closeWindow("music");
		expect(useWindowsStore.getState().windows.map((w) => w.id)).toEqual(["notes"]);
	});

	it("mueve una ventana", () => {
		useWindowsStore.getState().openWindow("notes");
		useWindowsStore.getState().moveWindow("notes", 120, 80);
		expect(useWindowsStore.getState().windows[0]).toMatchObject({ x: 120, y: 80 });
	});

	it("no deja arrastrar la ventana fuera del viewport (siempre queda barra de título)", () => {
		useWindowsStore.getState().openWindow("notes");
		useWindowsStore.getState().moveWindow("notes", -9999, -9999);
		expect(useWindowsStore.getState().windows[0].y).toBeGreaterThanOrEqual(-10);
		expect(useWindowsStore.getState().windows[0].x).toBe(-320);

		useWindowsStore.getState().moveWindow("notes", 99999, 99999);
		const window = useWindowsStore.getState().windows[0];
		expect(window.x).toBe(904);
		expect(window.y).toBe(744);
	});

	it("redimensiona y respeta el tamaño mínimo", () => {
		useWindowsStore.getState().openWindow("notes");
		useWindowsStore.getState().resizeWindow("notes", 10, 10, 500, 400);
		expect(useWindowsStore.getState().windows[0]).toMatchObject({ x: 10, y: 10, w: 500, h: 400 });
		useWindowsStore.getState().resizeWindow("notes", 10, 10, 50, 40);
		expect(useWindowsStore.getState().windows[0]).toMatchObject({ w: 300, h: 240 });
	});

	it("minimiza y restaura (al reabrir se restaura)", () => {
		useWindowsStore.getState().openWindow("clock");
		useWindowsStore.getState().toggleMinimize("clock");
		expect(useWindowsStore.getState().windows[0].minimized).toBe(true);
		useWindowsStore.getState().openWindow("clock");
		expect(useWindowsStore.getState().windows[0].minimized).toBe(false);
	});

	it("alterna maximizar", () => {
		useWindowsStore.getState().openWindow("gallery");
		useWindowsStore.getState().toggleMaximize("gallery");
		expect(useWindowsStore.getState().windows[0].maximized).toBe(true);
		useWindowsStore.getState().toggleMaximize("gallery");
		expect(useWindowsStore.getState().windows[0].maximized).toBe(false);
	});
});
