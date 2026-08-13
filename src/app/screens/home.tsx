import { useNavigationStore } from "@/app/navigation";
import { AppGlyph, type AppKind } from "@/app/os/app-icons";
import { MacWindow } from "@/app/os/mac-window";
import { MenuBar, useKeyboardShortcuts } from "@/app/os/menubar";
import {
	BatteryGlyph,
	CalendarWidget,
	ClockWidget,
	TrashGlyph,
	WifiGlyph,
} from "@/app/os/os-chrome";
import { useWindowsStore } from "@/app/windows";
import { useDialogueStore } from "@/features/dialogue";
import { useNotificationsStore } from "@/features/notifications";
import { useDeviceKind } from "@/shared/hooks/device";

interface AppDef {
	id: string;
	label: string;
	kind: AppKind;
	onOpen?: () => void;
	badge?: number;
}

/** Barra de estado iOS (springboard): hora a la izquierda, señal/batería a la derecha. */
function StatusBar() {
	const now = new Date();
	const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
	return (
		<div className="status-bar" aria-hidden="true">
			<span className="status-bar__left">{time}</span>
			<span className="status-bar__right">
				<span className="status-bar__signal">
					<i />
					<i />
					<i />
					<i />
				</span>
				<WifiGlyph size={15} />
				<BatteryGlyph size={15} />
			</span>
		</div>
	);
}

function AppIcon({
	app,
	size = "default",
	active = false,
}: {
	app: AppDef;
	size?: "default" | "dock";
	active?: boolean;
}) {
	const inner = (
		<>
			<span className="app-icon__glyph">
				<AppGlyph kind={app.kind} size={size === "dock" ? 48 : 60} />
			</span>
			{size === "default" ? <span className="app-icon__label">{app.label}</span> : null}
			{size === "dock" ? <span className="dock-tooltip">{app.label}</span> : null}
			{app.badge ? <span className="app-icon__badge">{app.badge}</span> : null}
		</>
	);

	const className = `app-icon ${size === "dock" ? "app-icon--dock" : ""}`;

	if (!app.onOpen) {
		return (
			<div
				className={`${className} app-icon--static`}
				data-active={active || undefined}
				role="img"
				aria-label={app.label}
			>
				{inner}
			</div>
		);
	}

	return (
		<button
			type="button"
			className={className}
			data-active={active || undefined}
			onClick={app.onOpen}
			aria-label={app.label}
		>
			{inner}
		</button>
	);
}

export function HomeScreen() {
	const navigate = useNavigationStore((state) => state.navigate);
	const unread = useNotificationsStore((state) => state.unreadCount());
	const started = useDialogueStore((state) => state.started);
	const start = useDialogueStore((state) => state.start);
	const device = useDeviceKind();

	useKeyboardShortcuts();

	function openChat() {
		if (!started) start();
		navigate("chat");
	}

	const apps: AppDef[] = [
		{ id: "messages", label: "Mensajes", kind: "messages", onOpen: openChat, badge: unread },
		{ id: "gallery", label: "Galería", kind: "gallery", onOpen: () => navigate("gallery") },
		{ id: "photos", label: "Fotos", kind: "photos", onOpen: () => navigate("gallery") },
		{ id: "history", label: "Historia", kind: "history", onOpen: () => navigate("history") },
		{ id: "notes", label: "Notas", kind: "notes", onOpen: () => navigate("notes") },
		{ id: "calendar", label: "Calendario", kind: "calendar", onOpen: () => navigate("calendar") },
		{ id: "clock", label: "Reloj", kind: "clock", onOpen: () => navigate("clock") },
		{ id: "music", label: "Música", kind: "music", onOpen: () => navigate("music") },
		{ id: "camera", label: "Cámara", kind: "camera", onOpen: () => navigate("camera") },
		{ id: "settings", label: "Ajustes", kind: "settings", onOpen: () => navigate("settings") },
	];

	const dockApps: AppDef[] = [
		{ id: "messages", label: "Mensajes", kind: "messages", onOpen: openChat, badge: unread },
		{ id: "gallery", label: "Galería", kind: "gallery", onOpen: () => navigate("gallery") },
		{ id: "history", label: "Historia", kind: "history", onOpen: () => navigate("history") },
		{ id: "photos", label: "Fotos", kind: "photos", onOpen: () => navigate("gallery") },
		{ id: "settings", label: "Ajustes", kind: "settings", onOpen: () => navigate("settings") },
	];

	// En el escritorio (macOS) las apps viven en el dock y se abren como ventanas.
	const openWindow = useWindowsStore((state) => state.openWindow);
	const windows = useWindowsStore((state) => state.windows);

	const laptopDock: AppDef[] = [
		{
			id: "messages",
			label: "Mensajes",
			kind: "messages",
			onOpen: () => openWindow("chat"),
			badge: unread,
		},
		{ id: "gallery", label: "Galería", kind: "gallery", onOpen: () => openWindow("gallery") },
		{ id: "photos", label: "Fotos", kind: "photos", onOpen: () => openWindow("gallery") },
		{ id: "history", label: "Historia", kind: "history", onOpen: () => openWindow("history") },
		{ id: "notes", label: "Notas", kind: "notes", onOpen: () => openWindow("notes") },
		{ id: "calendar", label: "Calendario", kind: "calendar", onOpen: () => openWindow("calendar") },
		{ id: "clock", label: "Reloj", kind: "clock", onOpen: () => openWindow("clock") },
		{ id: "music", label: "Música", kind: "music", onOpen: () => openWindow("music") },
		{ id: "camera", label: "Cámara", kind: "camera", onOpen: () => openWindow("camera") },
		{ id: "settings", label: "Ajustes", kind: "settings", onOpen: () => openWindow("settings") },
	];

	if (device === "laptop") {
		const minimized = windows.filter((window) => window.minimized);
		const isOpen = (id: string) => windows.some((window) => window.id === id && !window.minimized);
		return (
			<div className="desktop-root">
				<MenuBar />
				<div className="desktop">
					<div className="desktop__widgets">
						<ClockWidget large />
						<CalendarWidget />
					</div>
					{windows
						.filter((window) => !window.minimized)
						.map((window) => (
							<MacWindow key={window.id} win={window} />
						))}
					<div className="desktop__dock">
						{laptopDock.map((app) => (
							<AppIcon key={app.id} app={app} size="dock" active={isOpen(app.id)} />
						))}
						<span className="dock-divider" aria-hidden="true" />
						{minimized.map((window) => {
							const app = laptopDock.find((item) => item.id === window.id);
							return (
								<button
									key={window.id}
									type="button"
									className="dock-thumb"
									onClick={() => openWindow(window.id)}
									aria-label={`Restaurar ${app?.label ?? window.id}`}
								>
									<span className="app-icon__glyph">
										{app ? <AppGlyph kind={app.kind} size={52} /> : null}
									</span>
								</button>
							);
						})}
						<button type="button" className="dock-trash" aria-label="Papelera">
							<span className="dock-trash__glyph">
								<TrashGlyph size={22} />
							</span>
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`springboard springboard--${device}`}>
			<StatusBar />
			<div className="springboard__widgets">
				<CalendarWidget />
			</div>
			<div className="springboard__grid">
				{apps.map((app) => (
					<AppIcon key={app.id} app={app} />
				))}
			</div>
			<div className="springboard__dock">
				{dockApps.map((app) => (
					<AppIcon key={app.id} app={app} size="dock" />
				))}
			</div>
		</div>
	);
}
