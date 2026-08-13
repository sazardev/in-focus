export function estimateTypingDuration(charCount: number, wpm = 40): number {
	return Math.max(1, Math.round((charCount / (wpm * 5)) * 60 * 1000));
}

export function calculateReadDelay(charCount: number, minMs = 800, maxMs = 6000): number {
	const ms = charCount * 12;
	return Math.min(maxMs, Math.max(minMs, ms));
}
