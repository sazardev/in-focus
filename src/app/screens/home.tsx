import { useNavigationStore } from "@/app/navigation";
import { useDialogueStore } from "@/features/dialogue";
import { useNotificationsStore } from "@/features/notifications";
import { ChatIcon, GalleryIcon, InfoIcon } from "@/shared/ui";

export function HomeScreen() {
	const navigate = useNavigationStore((state) => state.navigate);
	const unread = useNotificationsStore((state) => state.unreadCount());
	const push = useNotificationsStore((state) => state.push);
	const started = useDialogueStore((state) => state.started);
	const start = useDialogueStore((state) => state.start);

	function openChat() {
		if (!started) start();
		navigate("chat");
	}

	return (
		<div className="home">
			<div className="home__dock">
				<button type="button" className="app-icon" onClick={openChat} aria-label="Mensajes">
					<span className="app-icon__glyph">
						<ChatIcon label="Mensajes" width={28} height={28} />
					</span>
					<span className="app-icon__label">Mensajes</span>
					{unread > 0 ? <span className="app-icon__badge">{unread}</span> : null}
				</button>

				<button
					type="button"
					className="app-icon"
					onClick={() => navigate("gallery")}
					aria-label="Galería"
				>
					<span className="app-icon__glyph">
						<GalleryIcon label="Galería" width={28} height={28} />
					</span>
					<span className="app-icon__label">Galería</span>
				</button>

				<button
					type="button"
					className="app-icon"
					onClick={() => navigate("settings")}
					aria-label="Configuración"
				>
					<span className="app-icon__glyph">
						<InfoIcon label="Configuración" width={28} height={28} />
					</span>
					<span className="app-icon__label">Ajustes</span>
				</button>
			</div>

			<button
				type="button"
				className="btn home__demo"
				onClick={() =>
					push({
						title: "Maya 📸",
						body: "Te mandé una foto nueva, ¡mírala!",
					})
				}
			>
				Simular notificación de Maya
			</button>
		</div>
	);
}
