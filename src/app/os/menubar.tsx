import { useEffect, useRef, useState } from "react";
import { useWindowsStore } from "@/app/windows";
import { useThemeStore } from "@/shared/theme";
import { AppleLogo, BatteryGlyph, useClock, WifiGlyph } from "./os-chrome";

interface MenuItem {
	key: string;
	label?: string;
	shortcut?: string;
	onSelect?: () => void;
	divider?: boolean;
}

interface Menu {
	label: string;
	items: MenuItem[];
}

const OPEN_APPS: [string, string][] = [
	["1", "chat"],
	["2", "gallery"],
	["3", "history"],
	["4", "notes"],
	["5", "calendar"],
	["6", "clock"],
	["7", "music"],
	["8", "camera"],
	["9", "settings"],
	["0", "gallery"],
];

export function useKeyboardShortcuts() {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return;
			const key = event.key.toLowerCase();
			const openWindow = useWindowsStore.getState().openWindow;
			const windows = useWindowsStore.getState().windows;
			const top = [...windows].sort((a, b) => b.z - a.z)[0];
			const command = (fn: () => void) => {
				event.preventDefault();
				fn();
			};

			if (event.shiftKey && key === "d") {
				command(() => useThemeStore.getState().toggleTheme());
				return;
			}
			if (key === "w" || key === "m") {
				if (!top) return;
				command(() => {
					if (key === "w") useWindowsStore.getState().closeWindow(top.id);
					else useWindowsStore.getState().toggleMinimize(top.id);
				});
				return;
			}
			if (key === ",") {
				command(() => openWindow("settings"));
				return;
			}
			if (key === "n") {
				command(() => openWindow("chat"));
				return;
			}
			const hit = OPEN_APPS.find(([shortcut]) => shortcut === key);
			if (hit) command(() => openWindow(hit[1]));
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);
}

function MenuDropdown({ menu }: { menu: Menu }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		window.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<div className="menubar__menu" ref={ref}>
			<button
				type="button"
				className="menubar__button"
				aria-expanded={open}
				aria-haspopup="menu"
				onClick={() => setOpen((value) => !value)}
			>
				{menu.label}
			</button>
			{open ? (
				<div className="menubar__menu-list" role="menu">
					{menu.items.map((item) =>
						item.divider ? (
							<div key={item.key} className="menubar__divider" aria-hidden="true" />
						) : (
							<button
								key={item.key}
								type="button"
								role="menuitem"
								className="menubar__item"
								onClick={() => {
									setOpen(false);
									item.onSelect?.();
								}}
							>
								<span>{item.label}</span>
								{item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
							</button>
						),
					)}
				</div>
			) : null}
		</div>
	);
}

/** Barra de menú macOS: logo, menús de la app y zona de estado (wifi/batería/reloj). */
export function MenuBar() {
	const now = useClock(1000);
	const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
	const date = now.toLocaleDateString("es-MX", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});

	const menus: Menu[] = [
		{
			label: "In Focus",
			items: [
				{
					key: "about",
					label: "Acerca de In Focus",
					onSelect: () => useWindowsStore.getState().openWindow("settings"),
				},
				{ key: "d1", divider: true },
				{
					key: "settings",
					label: "Ajustes…",
					shortcut: "⌘,",
					onSelect: () => useWindowsStore.getState().openWindow("settings"),
				},
				{ key: "d2", divider: true },
				{ key: "hide", label: "Ocultar In Focus", shortcut: "⌘H" },
				{ key: "quit", label: "Salir de In Focus" },
			],
		},
		{
			label: "Archivo",
			items: [
				{
					key: "new-message",
					label: "Nuevo mensaje",
					shortcut: "⌘N",
					onSelect: () => useWindowsStore.getState().openWindow("chat"),
				},
				{
					key: "new-note",
					label: "Nueva nota",
					onSelect: () => useWindowsStore.getState().openWindow("notes"),
				},
				{ key: "d1", divider: true },
				{
					key: "close",
					label: "Cerrar ventana",
					shortcut: "⌘W",
					onSelect: () => useWindowsStore.getState().closeTopWindow(),
				},
			],
		},
		{
			label: "Edición",
			items: [
				{ key: "copy", label: "Copiar", shortcut: "⌘C" },
				{ key: "paste", label: "Pegar", shortcut: "⌘V" },
				{ key: "d1", divider: true },
				{
					key: "dark",
					label: "Alternar tema oscuro",
					shortcut: "⇧⌘D",
					onSelect: () => useThemeStore.getState().toggleTheme(),
				},
			],
		},
		{
			label: "Ventana",
			items: [
				{
					key: "minimize",
					label: "Minimizar",
					shortcut: "⌘M",
					onSelect: () => useWindowsStore.getState().toggleTopWindowMinimize(),
				},
				{
					key: "zoom",
					label: "Zoom",
					onSelect: () => useWindowsStore.getState().toggleTopWindowMaximize(),
				},
			],
		},
		{
			label: "Ayuda",
			items: [
				{ key: "shortcuts", label: "Atajos de teclado", shortcut: "⌘1…9" },
				{ key: "about", label: "Acerca de In Focus" },
			],
		},
	];

	return (
		<header className="menubar">
			<div className="menubar__left">
				<span className="menubar__brand" aria-hidden="true">
					<AppleLogo size={15} />
					<span>In Focus</span>
				</span>
				{menus.map((menu) => (
					<MenuDropdown key={menu.label} menu={menu} />
				))}
			</div>
			<div className="menubar__right">
				<span className="menubar__status" aria-hidden="true">
					<BatteryGlyph size={15} />
					<WifiGlyph size={15} />
				</span>
				<span className="menubar__time" title={date}>
					{time}
				</span>
			</div>
		</header>
	);
}
