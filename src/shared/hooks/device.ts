import { useEffect, useState } from "react";

export type DeviceKind = "phone" | "tablet" | "laptop";

/**
 * Decide qué dispositivo simula la UI (DESIGN.md §5):
 * - <640px (o portrait estrecho) → móvil.
 * - Táctil ancho (pointer coarse sin fine) → tablet.
 * - Escritorio medio (640–1023px) → tablet (para que se pueda ver en web).
 * - Escritorio ancho (≥1024px) → laptop.
 */
function detect(): DeviceKind {
	const width = typeof window !== "undefined" ? window.innerWidth : 1024;
	const fine = window.matchMedia?.("(pointer: fine)").matches ?? false;
	const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;

	if (width < 640) return "phone";
	if (coarse && !fine) return "tablet";
	if (width >= 1024) return "laptop";
	return "tablet";
}

export function useDeviceKind(): DeviceKind {
	const [kind, setKind] = useState<DeviceKind>(detect);

	useEffect(() => {
		const update = () => setKind(detect());
		window.addEventListener("resize", update);
		window.addEventListener("orientationchange", update);
		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("orientationchange", update);
		};
	}, []);

	return kind;
}
