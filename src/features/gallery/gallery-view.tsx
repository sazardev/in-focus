import { useEffect, useState } from "react";
import { useGalleryStore } from "./store";

function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("es-MX", {
		day: "numeric",
		month: "short",
	});
}

export function GalleryView() {
	const photos = useGalleryStore((state) => state.photos);
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	useEffect(() => {
		if (openIndex === null) return;
		const handler = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpenIndex(null);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [openIndex]);

	if (photos.length === 0) {
		return (
			<div className="gallery gallery--empty">
				<p className="gallery__empty-title">Aún no hay fotos</p>
				<p className="gallery__empty-hint">
					Las fotografías que Maya te envíe aparecerán aquí automáticamente.
				</p>
			</div>
		);
	}

	return (
		<div className="gallery">
			<div className="gallery__grid">
				{photos.map((photo, index) => (
					<button
						type="button"
						key={photo.id}
						className="gallery__item"
						onClick={() => setOpenIndex(index)}
						aria-label={`Ver foto ${photo.id}`}
					>
						<img src={photo.sourcePath} alt={`Foto ${photo.id}`} loading="lazy" />
						<span className="gallery__date">{formatDate(photo.takenAt)}</span>
					</button>
				))}
			</div>

			{openIndex !== null ? (
				<div className="gallery__lightbox" role="dialog" aria-modal="true">
					<img
						src={photos[openIndex].sourcePath}
						alt={`Foto ${photos[openIndex].id}`}
						className="gallery__lightbox-img"
					/>
					<button
						type="button"
						className="gallery__close"
						onClick={() => setOpenIndex(null)}
						aria-label="Cerrar foto"
					>
						✕
					</button>
				</div>
			) : null}
		</div>
	);
}
