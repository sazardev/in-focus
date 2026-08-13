import { useEffect, useRef, useState } from "react";
import { playBoot } from "@/shared/sound";

const BOOT_MS = 1800;
const STEP_MS = 40;

const BOOT_LINES = [
	"Revelando el rollo…",
	"Cargando 36 fotos…",
	"Conectando con Maya…",
	"Enfocando…",
];

function BootLogo() {
	return (
		<svg
			viewBox="0 0 48 48"
			width="92"
			height="92"
			aria-hidden="true"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M9 14h6l2.5-3h13L33 14h6a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z" />
			<circle cx="24" cy="26" r="8" />
			<circle cx="33" cy="18" r="1.5" fill="currentColor" stroke="none" />
		</svg>
	);
}

/** Pantalla de arranque del "sistema": logo + barra de progreso + fade a la app. */
export function BootScreen({ onDone }: { onDone: () => void }) {
	const [progress, setProgress] = useState(0);
	const [lineIndex, setLineIndex] = useState(0);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		playBoot();
	}, []);

	useEffect(() => {
		const steps = Math.round(BOOT_MS / STEP_MS);
		let i = 0;
		let finished = false;

		const id = setInterval(() => {
			i += 1;
			const p = Math.min(1, i / steps);
			setProgress(p);
			setLineIndex(Math.min(BOOT_LINES.length - 1, Math.floor(p * BOOT_LINES.length)));
			if (p >= 1) {
				clearInterval(id);
				if (!finished) {
					finished = true;
					setTimeout(() => onDoneRef.current(), 260);
				}
			}
		}, STEP_MS);

		return () => clearInterval(id);
	}, []);

	return (
		<div className="boot" role="status" aria-label="Iniciando In Focus">
			<div className="boot__logo">
				<BootLogo />
			</div>
			<span className="boot__brand">In Focus</span>
			<div className="boot__progress">
				<span className="boot__bar" style={{ transform: `scaleX(${progress})` }} />
			</div>
			<span className="boot__line">{BOOT_LINES[lineIndex]}</span>
		</div>
	);
}
