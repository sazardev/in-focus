import { create } from "zustand";

export interface PushNotification {
	id: string;
	title: string;
	body: string;
	receivedAt: number;
	read: boolean;
}

interface NotificationsState {
	notifications: PushNotification[];
	push: (notification: Omit<PushNotification, "id" | "receivedAt" | "read">) => void;
	markRead: (id: string) => void;
	clear: () => void;
	unreadCount: () => number;
}

let notifSeq = 0;

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	notifications: [],

	push: ({ title, body }) => {
		notifSeq += 1;
		const notification: PushNotification = {
			id: `notif-${notifSeq}`,
			title,
			body,
			receivedAt: Date.now(),
			read: false,
		};
		set((state) => ({
			notifications: [...state.notifications.slice(-4), notification],
		}));
	},

	markRead: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
		})),

	clear: () => set({ notifications: [] }),

	unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
