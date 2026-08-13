import { useEffect } from "react";
import { useNotificationsStore } from "./store";

/**
 * Pila de notificaciones push ficticias. Se auto-descartan tras unos
 * segundos y pueden cerrarse con un toque.
 */
export function NotificationStack() {
	const notifications = useNotificationsStore((state) => state.notifications);
	const markRead = useNotificationsStore((state) => state.markRead);
	const clear = useNotificationsStore((state) => state.clear);

	useEffect(() => {
		if (notifications.length === 0) return;
		const timer = setTimeout(() => {
			clear();
		}, 6000);
		return () => clearTimeout(timer);
	}, [notifications.length, clear]);

	if (notifications.length === 0) return null;

	return (
		<aside className="notifications" aria-label="Notificaciones">
			{notifications.map((notification) => (
				<button
					type="button"
					key={notification.id}
					className="notification"
					onClick={() => markRead(notification.id)}
				>
					<span className="notification__avatar">📸</span>
					<span className="notification__content">
						<span className="notification__title">{notification.title}</span>
						<span className="notification__body">{notification.body}</span>
					</span>
				</button>
			))}
		</aside>
	);
}
