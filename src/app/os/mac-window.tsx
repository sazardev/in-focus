import { type ComponentType, memo, useEffect, useRef, useState } from "react";
import { CalendarScreen } from "@/app/screens/calendar";
import { CameraScreen } from "@/app/screens/camera";
import { ChatScreen } from "@/app/screens/chat";
import { ClockScreen } from "@/app/screens/clock";
import { GalleryScreen } from "@/app/screens/gallery";
import { HistoryScreen } from "@/app/screens/history";
import { MusicScreen } from "@/app/screens/music";
import { NotesScreen } from "@/app/screens/notes";
import { SettingsScreen } from "@/app/screens/settings";
import { type MacWindowState, useWindowsStore } from "@/app/windows";
import { useRenderTick } from "@/shared/perf/perf";

const APP_SCREENS: Record<string, ComponentType> = {
	chat: ChatScreen,
	gallery: GalleryScreen,
	history: HistoryScreen,
	settings: SettingsScreen,
	notes: NotesScreen,
	calendar: CalendarScreen,
	clock: ClockScreen,
	music: MusicScreen,
	camera: CameraScreen,
};

const APP_TITLES: Record<string, string> = {
	chat: "Mensajes",
	gallery: "Galería",
	history: "Historia",
	settings: "Ajustes",
	notes: "Notas",
	calendar: "Calendario",
	clock: "Reloj",
	music: "Música",
	camera: "Cámara",
};

/** Ventana macOS en el escritorio: semáforos, arrastre por la barra, redimensionado. */
export const MacWindow = memo(function MacWindow({ win }: { win: MacWindowState }) {
	useRenderTick();
	const closeWindow = useWindowsStore((state) => state.closeWindow);
	const focusWindow = useWindowsStore((state) => state.focusWindow);
	const moveWindow = useWindowsStore((state) => state.moveWindow);
	const resizeWindow = useWindowsStore((state) => state.resizeWindow);
	const toggleMinimize = useWindowsStore((state) => state.toggleMinimize);
	const toggleMaximize = useWindowsStore((state) => state.toggleMaximize);
	const topZ = useWindowsStore((state) => state.topZ);
	const focused = win.z === topZ;

	const MIN_W = 300;
	const MIN_H = 240;

	// Salida animada: cierra/minimiza tras el keyframe para que se vea el efecto.
	const [exiting, setExiting] = useState<"close" | "minimize" | null>(null);
	const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (exitTimer.current) clearTimeout(exitTimer.current);
		},
		[],
	);

	function exit(kind: "close" | "minimize") {
		if (exiting) return;
		setExiting(kind);
		exitTimer.current = setTimeout(() => {
			if (kind === "close") closeWindow(win.id);
			else toggleMinimize(win.id);
		}, 200);
	}

	function onTitlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
		if (win.maximized || exiting) return;
		event.preventDefault();
		focusWindow(win.id);
		const startX = event.clientX;
		const startY = event.clientY;
		const originX = win.x;
		const originY = win.y;

		const onMove = (ev: PointerEvent) => {
			moveWindow(win.id, originX + ev.clientX - startX, originY + ev.clientY - startY);
		};
		const onUp = () => window.removeEventListener("pointermove", onMove);
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, { once: true });
	}

	/** Redimensiona desde un borde o esquina (`direction` combina n/s/e/w). */
	function onResizeStart(direction: string) {
		return (event: React.PointerEvent<HTMLDivElement>) => {
			if (win.maximized) return;
			event.preventDefault();
			event.stopPropagation();
			focusWindow(win.id);
			const startX = event.clientX;
			const startY = event.clientY;
			const origin = { x: win.x, y: win.y, w: win.w, h: win.h };

			const onMove = (ev: PointerEvent) => {
				const dx = ev.clientX - startX;
				const dy = ev.clientY - startY;
				let { x, y, w, h } = origin;
				if (direction.includes("e")) w = Math.max(MIN_W, origin.w + dx);
				if (direction.includes("s")) h = Math.max(MIN_H, origin.h + dy);
				if (direction.includes("w")) {
					w = Math.max(MIN_W, origin.w - dx);
					x = origin.x + (origin.w - w);
				}
				if (direction.includes("n")) {
					h = Math.max(MIN_H, origin.h - dy);
					y = origin.y + (origin.h - h);
				}
				resizeWindow(win.id, x, y, w, h);
			};
			const onUp = () => window.removeEventListener("pointermove", onMove);
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp, { once: true });
		};
	}

	const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

	return (
		<section
			className={`mac-window ${win.maximized ? "mac-window--maximized" : ""} ${focused ? "mac-window--focused" : ""} ${exiting === "close" ? "mac-window--close" : ""} ${exiting === "minimize" ? "mac-window--minimize" : ""}`}
			style={{
				left: 0,
				top: 0,
				translate: `${win.x}px ${win.y}px`,
				width: win.w,
				height: win.h,
				zIndex: win.z,
			}}
			role="dialog"
			aria-label={APP_TITLES[win.id] ?? win.id}
			onPointerDown={() => focusWindow(win.id)}
		>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: doble clic en la barra para maximizar (asidero de arrastre) */}
			<header
				className="mac-window__titlebar"
				onPointerDown={onTitlePointerDown}
				onDoubleClick={() => toggleMaximize(win.id)}
			>
				<div className="mac-window__lights" onPointerDown={(event) => event.stopPropagation()}>
					<button
						type="button"
						className="mac-light mac-light--close"
						aria-label="Cerrar"
						onClick={() => exit("close")}
					/>
					<button
						type="button"
						className="mac-light mac-light--min"
						aria-label="Minimizar"
						onClick={() => exit("minimize")}
					/>
					<button
						type="button"
						className="mac-light mac-light--max"
						aria-label="Maximizar"
						onClick={() => toggleMaximize(win.id)}
					/>
				</div>
				<span className="mac-window__title">{APP_TITLES[win.id] ?? win.id}</span>
				<span className="mac-window__spacer" aria-hidden="true" />
			</header>
			<WindowContent winId={win.id} />
			{!win.maximized
				? handles.map((direction) => (
						<span
							key={direction}
							className={`mac-resize mac-resize--${direction}`}
							onPointerDown={onResizeStart(direction)}
						/>
					))
				: null}
			{!win.maximized ? <span className="mac-window__grip" aria-hidden="true" /> : null}
		</section>
	);
});

/**
 * El contenido de la ventana va memoizado por id: al arrastrar o redimensionar
 * la ventana, React re-renderiza solo el frame (position/size), nunca el screen
 * interno. Los screens se re-renderizan por sí solos cuando su store cambia.
 */
const WindowContent = memo(function WindowContent({ winId }: { winId: string }) {
	const Content = APP_SCREENS[winId] ?? null;
	return <div className="mac-window__body">{Content ? <Content /> : null}</div>;
});
