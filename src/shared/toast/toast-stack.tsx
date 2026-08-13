import { useToastStore } from "./store";

/** Pila de mensajes de usabilidad (toasts) en la parte inferior. */
export function ToastStack() {
	const toasts = useToastStore((state) => state.toasts);
	const dismiss = useToastStore((state) => state.dismiss);

	if (toasts.length === 0) return null;

	return (
		<div className="toast-stack" aria-live="polite">
			{toasts.map((toast) => (
				<button type="button" key={toast.id} className="toast" onClick={() => dismiss(toast.id)}>
					{toast.text}
				</button>
			))}
		</div>
	);
}
