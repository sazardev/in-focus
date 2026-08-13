import { useInsertionEffect } from "react";
import { create } from "zustand";

/**
 * Métricas de rendimiento en vivo: FPS, tiempo de frame, long frames y
 * renders de React. El medidor corre en un `requestAnimationFrame` y solo
 * notifica a los componentes que se suscriben (overlay, Ajustes).
 */
export interface PerfMetrics {
	fps: number;
	frameMs: number;
	lastFrameMs: number;
	maxFrameMs: number;
	longFrames: number;
	jankFrames: number;
	renders: number;
	rendersPerSec: number;
	overlayEnabled: boolean;
}

const WINDOW = 60;

export const usePerfStore = create<PerfMetrics>(() => ({
	fps: 0,
	frameMs: 0,
	lastFrameMs: 0,
	maxFrameMs: 0,
	longFrames: 0,
	jankFrames: 0,
	renders: 0,
	rendersPerSec: 0,
	overlayEnabled: false,
}));

/** Alterna el overlay de métricas (también con Ctrl/Cmd+Shift+P). */
export function togglePerfOverlay() {
	usePerfStore.setState((state) => ({ overlayEnabled: !state.overlayEnabled }));
}

let meterStarted = false;
let lastT = 0;
const deltas: number[] = [];
let secondStart = 0;
let rendersAtSecondStart = 0;

function meterLoop(t: number) {
	if (lastT > 0) {
		const dt = t - lastT;
		deltas.push(dt);
		if (deltas.length > WINDOW) deltas.shift();

		if (t - secondStart >= 1000) {
			const renders = usePerfStore.getState().renders;
			usePerfStore.setState({ rendersPerSec: renders - rendersAtSecondStart });
			rendersAtSecondStart = renders;
			secondStart = t;
		}

		const avg = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
		const max = Math.max(...deltas);
		usePerfStore.setState({
			fps: 1000 / avg,
			frameMs: avg,
			lastFrameMs: dt,
			maxFrameMs: max,
			longFrames: deltas.filter((value) => value > 16.7).length,
			jankFrames: deltas.filter((value) => value > 50).length,
		});
	}
	lastT = t;
	requestAnimationFrame(meterLoop);
}

/** Arranca el medidor de frames (idempotente). Llamar una vez desde App. */
export function startPerfMeter() {
	if (meterStarted || typeof window === "undefined") return;
	meterStarted = true;
	lastT = 0;
	requestAnimationFrame(meterLoop);
}

/**
 * Cuenta los renders de los componentes instrumentados. Llamar en el body de
 * componentes clave (App, screens, ventanas) para medir la actividad de React.
 */
export function useRenderTick() {
	useInsertionEffect(() => {
		usePerfStore.setState((state) => ({ renders: state.renders + 1 }));
	});
}
