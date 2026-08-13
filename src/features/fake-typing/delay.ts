export function estimateTypingDuration(charCount: number, wpm = 40): number {
	return Math.max(1, Math.round((charCount / (wpm * 5)) * 60 * 1000));
}

/** Variación aleatoria para que el tecleo no se sienta robótico. */
function jitter(ms: number, spread = 0.35): number {
	return Math.round(ms * (1 - spread / 2 + Math.random() * spread));
}

/**
 * Pausa de "escribiendo..." antes de que aparezca un mensaje de Maya.
 * Más lenta que antes y con jitter; los mensajes con puntos suspensivos o
 * preguntas (tensión) tardan más en llegar.
 */
export function calculateReadDelay(
	charCount: number,
	minMs = 1200,
	maxMs = 10000,
	text?: string,
): number {
	let base = charCount * 20;
	if (text) {
		const suspense = [...text].filter((c) => c === "…" || c === "?").length;
		base += suspense * 700;
	}
	const clamped = Math.min(maxMs, Math.max(minMs, base));
	return Math.min(maxMs, Math.max(minMs, jitter(clamped)));
}
