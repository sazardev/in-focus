import { useGameClockStore } from "./store";

/**
 * Contador a la exposición: aparece desde que Maya anuncia "El plan"
 * (expoDay fijado) y va bajando con el reloj de juego. Se oculta cuando
 * el evento pasa.
 */
export function ExpoCountdown() {
	const day = useGameClockStore((state) => state.day);
	const expoDay = useGameClockStore((state) => state.expoDay);

	if (expoDay == null) return null;

	const days = expoDay - day;
	if (days < 0) return null;

	const label =
		days === 0
			? "La exposición es hoy"
			: days === 1
				? "La exposición es mañana"
				: `La exposición en ${days} días`;

	return (
		<div className="expo-countdown" role="status" aria-label={label}>
			<span className="expo-countdown__dot" aria-hidden="true" />
			{label}
		</div>
	);
}
