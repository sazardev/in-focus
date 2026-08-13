import { useCallback, useEffect, useRef } from "react";
import { useFakeTypingStore } from "./store";

/**
 * Une las pulsaciones (teclas físicas + teclas del teclado virtual) con el
 * auto-fill del teclado falso. Cualquier tecla avanza el texto predefinido
 * y dispara onComplete la primera vez que el mensaje queda completo.
 */
export function useFakeTyping(onComplete?: () => void) {
	const status = useFakeTypingStore((state) => state.status);
	const isComplete = useFakeTypingStore((state) => state.isComplete);
	const pressKey = useFakeTypingStore((state) => state.pressKey);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	const press = useCallback(() => {
		const completed = pressKey();
		if (completed) onCompleteRef.current?.();
	}, [pressKey]);

	useEffect(() => {
		if (status !== "typing") return;
		const handler = (event: KeyboardEvent) => {
			event.preventDefault();
			press();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [status, press]);

	return { status, isComplete, press };
}
