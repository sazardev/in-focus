import { useEffect, useState } from "react";
import { AppScreen } from "./app-screen";

interface Track {
	title: string;
	artist: string;
	color: string;
}

const TRACKS: Track[] = [
	{ title: "Colores para ti", artist: "Maya", color: "linear-gradient(145deg,#e5846b,#c4573b)" },
	{ title: "Ámbar", artist: "Maya", color: "linear-gradient(145deg,#f2c14e,#d99a2b)" },
	{ title: "Azul noche", artist: "Maya", color: "linear-gradient(145deg,#4b6ea8,#2f487a)" },
	{ title: "La calle vacía", artist: "Maya", color: "linear-gradient(145deg,#7a6c5e,#4b453e)" },
	{ title: "Amanecer lento", artist: "Maya", color: "linear-gradient(145deg,#e0a45e,#c8823d)" },
];

const TRACK_SECONDS = 18;
const TOTAL_LABEL = "0:18";

export function MusicScreen() {
	const [current, setCurrent] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (!playing) return;
		const id = setInterval(() => setElapsed((value) => (value + 1) % TRACK_SECONDS), 1000);
		return () => clearInterval(id);
	}, [playing]);

	function select(index: number) {
		setCurrent(index);
		setElapsed(0);
		setPlaying(true);
	}

	const track = TRACKS[current];
	const progress = (elapsed / TRACK_SECONDS) * 100;
	const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

	return (
		<AppScreen title="Música">
			<div className="music">
				<div className="music__now">
					<div className="music__art" style={{ background: track.color }} />
					<div className="music__now-meta">
						<span className="music__track">{track.title}</span>
						<span className="music__artist">{track.artist}</span>
					</div>
					{playing ? (
						<div className="music__eq" aria-hidden="true">
							<span />
							<span />
							<span />
							<span />
							<span />
						</div>
					) : null}
				</div>

				<div className="music__progress">
					<div className="music__bar">
						<span className="music__fill" style={{ width: `${progress}%` }} />
					</div>
					<div className="music__times">
						<span>{elapsedLabel}</span>
						<span>{TOTAL_LABEL}</span>
					</div>
				</div>

				<div className="music__controls">
					<button
						type="button"
						className="music__control"
						aria-label="Anterior"
						onClick={() => select((current + TRACKS.length - 1) % TRACKS.length)}
					>
						⏮
					</button>
					<button
						type="button"
						className="music__control music__control--play"
						aria-label={playing ? "Pausa" : "Reproducir"}
						onClick={() => {
							if (!playing) setElapsed(0);
							setPlaying(!playing);
						}}
					>
						{playing ? "⏸" : "▶"}
					</button>
					<button
						type="button"
						className="music__control"
						aria-label="Siguiente"
						onClick={() => select((current + 1) % TRACKS.length)}
					>
						⏭
					</button>
				</div>

				<ul className="music__list">
					{TRACKS.map((item, index) => (
						<li key={item.title}>
							<button
								type="button"
								className={`music__row ${index === current ? "music__row--active" : ""}`}
								onClick={() => select(index)}
							>
								<span className="music__row-art" style={{ background: item.color }} />
								<span className="music__row-meta">
									<span className="music__row-title">{item.title}</span>
									<span className="music__row-artist">{item.artist}</span>
								</span>
								<span className="music__row-indicator" aria-hidden="true">
									{index === current && playing ? "♫" : ""}
								</span>
							</button>
						</li>
					))}
				</ul>
			</div>
		</AppScreen>
	);
}
