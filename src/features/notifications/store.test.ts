import { afterEach, describe, expect, it } from "vitest";
import { useNotificationsStore } from "./store";

afterEach(() => {
	useNotificationsStore.setState({ notifications: [] });
});

describe("notifications store", () => {
	it("empuja una notificación no leída", () => {
		useNotificationsStore.getState().push({ title: "Maya", body: "Mira!" });
		const state = useNotificationsStore.getState();
		expect(state.notifications).toHaveLength(1);
		expect(state.notifications[0].read).toBe(false);
		expect(state.unreadCount()).toBe(1);
	});

	it("marca como leída una notificación", () => {
		useNotificationsStore.getState().push({ title: "Maya", body: "Mira!" });
		const id = useNotificationsStore.getState().notifications[0].id;
		useNotificationsStore.getState().markRead(id);
		expect(useNotificationsStore.getState().unreadCount()).toBe(0);
	});

	it("limita la pila a las últimas 5", () => {
		for (let i = 0; i < 8; i++) {
			useNotificationsStore.getState().push({ title: "Maya", body: `Mensaje ${i}` });
		}
		expect(useNotificationsStore.getState().notifications.length).toBeLessThanOrEqual(5);
	});

	it("clear vacía la pila", () => {
		useNotificationsStore.getState().push({ title: "Maya", body: "Mira!" });
		useNotificationsStore.getState().clear();
		expect(useNotificationsStore.getState().notifications).toHaveLength(0);
	});
});
