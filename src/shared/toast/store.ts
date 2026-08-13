import { create } from "zustand";

export interface Toast {
	id: number;
	text: string;
}

interface ToastState {
	toasts: Toast[];
	push: (text: string) => void;
	dismiss: (id: number) => void;
}

let toastSeq = 0;

const TOAST_MS = 2400;

export const useToastStore = create<ToastState>((set, get) => ({
	toasts: [],

	push: (text) => {
		toastSeq += 1;
		const id = toastSeq;
		set((state) => ({ toasts: [...state.toasts, { id, text }] }));
		setTimeout(() => get().dismiss(id), TOAST_MS);
	},

	dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
