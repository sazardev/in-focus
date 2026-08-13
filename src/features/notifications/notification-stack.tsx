import { useEffect } from "react";
import { useDeviceKind } from "@/shared/hooks/device";
import { useNotificationsStore } from "./store";

/**
 * Pila de notificaciones push ficticias. Se auto-descartan tras unos
 * segundos y pueden cerrarse con un toque. El estilo se adapta al
 * dispositivo: banner iOS (móvil/tablet) o banner macOS (escritorio).
 */
export function NotificationStack() {
	const notifications = useNotificationsStore((state) => state.notifications);
	const markRead = useNotificationsStore((state) => state.markRead);
	const clear = useNotificationsStore((state) => state.clear);
	const device = useDeviceKind();

	useEffect(() => {
		if (notifications.length === 0) return;
		const timer = setTimeout(() => {
			clear();
		}, 6000);
		return () => clearTimeout(timer);
	}, [notifications.length, clear]);

	if (notifications.length === 0) return null;

	return (
		<aside className={`notifications notifications--${device}`} aria-label="Notificaciones">
			{notifications.map((notification) => (
				<button
					type="button"
					key={notification.id}
					className="notification"
					onClick={() => markRead(notification.id)}
				>
					<span className="notification__avatar">📸</span>
					<span className="notification__content">
						<span className="notification__meta">
							<span className="notification__app">In Focus</span>
							<span className="notification__time">
								{new Date(notification.receivedAt).toLocaleTimeString("es-MX", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</span>
						<span className="notification__title">{notification.title}</span>
						<span className="notification__body">{notification.body}</span>
					</span>
				</button>
			))}
		</aside>
	);
}
