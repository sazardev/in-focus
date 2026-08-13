import { useEffect, useRef } from "react";
import { togglePerfOverlay, usePerfStore } from "@/shared/perf/perf";
import "./perf.css";

/**
 * Overlay de métricas en vivo (dev tool). Se alterna con Ctrl/Cmd+Shift+P o
 * desde Ajustes → Rendimiento. Muestra FPS, tiempo de frame, long/jank frames,
 * renders de React por segundo y una mini sparkline de FPS.
 */
export function PerfOverlay() {
	const enabled = usePerfStore((state) => state.overlayEnabled);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "p") {
				event.preventDefault();
				togglePerfOverlay();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	if (!enabled) return null;
	return (
		<aside className="perf-overlay" aria-hidden="true">
			<PerfReadout />
		</aside>
	);
}

function PerfReadout() {
	const fps = usePerfStore((state) => state.fps);
	const frameMs = usePerfStore((state) => state.frameMs);
	const lastFrameMs = usePerfStore((state) => state.lastFrameMs);
	const maxFrameMs = usePerfStore((state) => state.maxFrameMs);
	const longFrames = usePerfStore((state) => state.longFrames);
	const jankFrames = usePerfStore((state) => state.jankFrames);
	const rendersPerSec = usePerfStore((state) => state.rendersPerSec);

	const spark = useRef<number[]>([]);
	if (spark.current[spark.current.length - 1] !== fps) {
		spark.current.push(fps);
		if (spark.current.length > 60) spark.current.shift();
	}

	const fpsColor = fps >= 55 ? "#30d158" : fps >= 40 ? "#ffd60a" : "#ff453a";

	return (
		<div className="perf-overlay__panel">
			<div className="perf-overlay__row">
				<span className="perf-overlay__value" style={{ color: fpsColor }}>
					{fps.toFixed(1)}
				</span>
				<span className="perf-overlay__unit">fps</span>
				<span className="perf-overlay__value">{frameMs.toFixed(1)}</span>
				<span className="perf-overlay__unit">ms</span>
			</div>
			<div className="perf-overlay__row">
				<span>
					frame {lastFrameMs.toFixed(1)} · máx {maxFrameMs.toFixed(1)} ms
				</span>
			</div>
			<div className="perf-overlay__row">
				<span className={longFrames > 8 ? "perf-overlay__bad" : ""}>long {longFrames}</span>
				<span className={jankFrames > 0 ? "perf-overlay__bad" : ""}>jank {jankFrames}</span>
				<span>renders/s {rendersPerSec}</span>
			</div>
			<Sparkline points={spark.current} />
		</div>
	);
}

function Sparkline({ points }: { points: number[] }) {
	const W = 140;
	const H = 26;
	if (points.length < 2) return null;
	const max = Math.max(60, ...points);
	const min = Math.min(0, ...points);
	const range = max - min || 1;
	const polyline = points
		.map(
			(point, index) =>
				`${((index / (points.length - 1)) * W).toFixed(1)},${(H - ((point - min) / range) * H).toFixed(1)}`,
		)
		.join(" ");
	return (
		<svg
			className="perf-overlay__spark"
			width={W}
			height={H}
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<polyline points={polyline} fill="none" stroke="#ffd60a" strokeWidth="1.5" />
		</svg>
	);
}
