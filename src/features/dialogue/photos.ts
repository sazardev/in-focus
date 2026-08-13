/**
 * Catálogo de fotografías que Maya puede enviar (STORY.md §8).
 * En producción estas rutas apuntan a archivos locales gestionados por Rust
 * (carga diferida vía IPC); aquí usamos imágenes de demostración.
 *
 * Los ids con nombres semánticos se referencian desde los capítulos `.yarn`.
 */
export const PHOTO_CATALOG: Record<string, string> = {
	atardecer: "https://picsum.photos/seed/maya-atardecer/600/400",
	neon: "https://picsum.photos/seed/maya-neon/600/400",
	luz: "https://picsum.photos/seed/maya-luz/600/400",
	mapa: "https://picsum.photos/seed/maya-mapa/600/400",
	azotea: "https://picsum.photos/seed/maya-azotea/600/400",
	playlist: "https://picsum.photos/seed/maya-playlist/600/400",
	cuarto: "https://picsum.photos/seed/maya-cuarto/600/400",
	caos: "https://picsum.photos/seed/maya-caos/600/400",
	pelicula: "https://picsum.photos/seed/maya-pelicula/600/400",
	rollo: "https://picsum.photos/seed/maya-rollo/600/400",
	mercadillo: "https://picsum.photos/seed/maya-mercadillo/600/400",
	autoescudo: "https://picsum.photos/seed/maya-autoescudo/600/400",
	exposicion: "https://picsum.photos/seed/maya-exposicion/600/400",
	ventana: "https://picsum.photos/seed/maya-ventana/600/400",
	lluvia: "https://picsum.photos/seed/maya-lluvia/600/400",
	calle_vacia: "https://picsum.photos/seed/maya-calle-vacia/600/400",
	escalera: "https://picsum.photos/seed/maya-escalera/600/400",
	sombra: "https://picsum.photos/seed/maya-sombra/600/400",
	selfie_timida: "https://picsum.photos/seed/maya-selfie-timida/600/400",
	selfie_atrevida: "https://picsum.photos/seed/maya-selfie-atrevida/600/400",
	flor: "https://picsum.photos/seed/maya-flor/600/400",
	flores_marchitas: "https://picsum.photos/seed/maya-flores-marchitas/600/400",
	audios: "https://picsum.photos/seed/maya-audios/600/400",
	noche: "https://picsum.photos/seed/maya-noche/600/400",
	desayuno: "https://picsum.photos/seed/maya-desayuno/600/400",
	gato: "https://picsum.photos/seed/maya-gato/600/400",
	ciudad_3am: "https://picsum.photos/seed/maya-ciudad-3am/600/400",
	plano: "https://picsum.photos/seed/maya-plano/600/400",
	escaparate: "https://picsum.photos/seed/maya-escaparate/600/400",
	brindis: "https://picsum.photos/seed/maya-brindis/600/400",
	amanecer_lento: "https://picsum.photos/seed/maya-amanecer-lento/600/400",
	enmarcada: "https://picsum.photos/seed/maya-enmarcada/600/400",
};

export function resolvePhotoUrl(photoId: string): string | null {
	return PHOTO_CATALOG[photoId] ?? null;
}
