import { useCallback, useEffect, useRef, useState } from "react";

interface UseLongPressOptions {
	onLongPress: () => void;
	/** Duración en ms para considerar el toque como "presión larga". */
	threshold?: number;
}

/**
 * Detecta presión larga (toque sostenido) sobre un elemento, útil para
 * mostrar el menú de reacciones estilo iMessage sobre las fotos.
 */
export function useLongPress<T extends HTMLElement>({
	onLongPress,
	threshold = 500,
}: UseLongPressOptions) {
	const [pressed, setPressed] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onLongPressRef = useRef(onLongPress);
	onLongPressRef.current = onLongPress;

	const clear = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setPressed(false);
	}, []);

	const start = useCallback(
		(event: React.PointerEvent<T>) => {
			event.preventDefault();
			setPressed(true);
			timerRef.current = setTimeout(() => {
				onLongPressRef.current();
				setPressed(false);
			}, threshold);
		},
		[threshold],
	);

	useEffect(() => clear, [clear]);

	return {
		pressed,
		onPointerDown: start,
		onPointerUp: clear,
		onPointerLeave: clear,
		onPointerCancel: clear,
	};
}
