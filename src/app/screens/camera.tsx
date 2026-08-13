import { useRef, useState } from "react";
import { useGalleryStore } from "@/features/gallery/store";
import { useToastStore } from "@/shared/toast/store";
import { AppScreen } from "./app-screen";

const CAPTURE_URLS = [
	"https://picsum.photos/seed/captura-1/600/800",
	"https://picsum.photos/seed/captura-2/600/800",
	"https://picsum.photos/seed/captura-3/600/800",
	"https://picsum.photos/seed/captura-4/600/800",
];

export function CameraScreen() {
	const [captured, setCaptured] = useState<string | null>(null);
	const [flash, setFlash] = useState(false);
	const seq = useRef(0);

	function capture() {
		seq.current += 1;
		const url = CAPTURE_URLS[seq.current % CAPTURE_URLS.length];
		setFlash(true);
		setTimeout(() => setFlash(false), 240);
		setCaptured(url);
	}

	function keep() {
		if (!captured) return;
		useGalleryStore.getState().addPhoto({
			id: `captura-${seq.current}-${Date.now()}`,
			sourcePath: captured,
			takenAt: Date.now(),
			unlocked: true,
		});
		useToastStore.getState().push("Foto guardada en la Galería");
		setCaptured(null);
	}

	return (
		<AppScreen title="Cámara">
			<div className="camera">
				<div className="camera__viewport">
					<div className="camera__grid" aria-hidden="true" />
					{captured ? (
						<img src={captured} alt="Captura" className="camera__capture" />
					) : (
						<span className="camera__hint">Apunta y dispara</span>
					)}
					{flash ? <div className="camera__flash" aria-hidden="true" /> : null}
				</div>

				<div className="camera__controls">
					<button
						type="button"
						className="camera__shutter"
						aria-label="Disparar"
						onClick={capture}
					/>
				</div>

				{captured ? (
					<div className="camera__actions">
						<button type="button" className="btn btn--primary" onClick={keep}>
							Guardar en Galería
						</button>
						<button type="button" className="btn" onClick={() => setCaptured(null)}>
							Descartar
						</button>
					</div>
				) : null}
			</div>
		</AppScreen>
	);
}
