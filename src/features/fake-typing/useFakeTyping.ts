import { useEffect, useRef } from "react";
import { useFakeTypingStore } from "./store";

const AUTO_TYPING_MS = 80;

/**
 * Simula el tecleo de la respuesta elegida: una vez que `chooseOption` activa
 * el auto-fill (status "typing"), este hook avanza el texto solo, letra a
 * letra, y llama a `onComplete` (enviar) cuando termina. El jugador solo
 * elige la opción; no hay teclado virtual ni pulsaciones.
 */
export function useFakeTyping(onComplete?: () => void) {
	const status = useFakeTypingStore((state) => state.status);
	const pressKey = useFakeTypingStore((state) => state.pressKey);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	useEffect(() => {
		if (status !== "typing") return;

		const interval = setInterval(() => {
			const completed = pressKey();
			if (completed) {
				clearInterval(interval);
				onCompleteRef.current?.();
			}
		}, AUTO_TYPING_MS);

		return () => clearInterval(interval);
	}, [status, pressKey]);

	return { status };
}
