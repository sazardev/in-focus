/**
 * Carga multi-capítulo (STORY.md §9): concatena todos los archivos `.yarn`
 * de `./chapters/` en orden de nombre para compilarlos como un solo programa
 * Yarn. Cada capítulo vive en `scripts/chapters/NN-titulo.yarn`.
 *
 * Los títulos de nodo deben ser únicos a nivel global (prefijo `CapN_`).
 */
const chapterModules = import.meta.glob("./chapters/*.yarn", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const chapterKeys = Object.keys(chapterModules).sort();

/** Devuelve los fuentes de cada capítulo en orden. */
export function loadChapterScripts(): string[] {
	return chapterKeys.map((key) => chapterModules[key]);
}

/** Capítulo con su nombre de archivo (para el motor de validación). */
export interface ChapterSource {
	file: string;
	source: string;
}

/** Devuelve cada capítulo con su nombre de archivo, en orden. */
export function loadChapterSources(): ChapterSource[] {
	return chapterKeys.map((key) => ({
		file: key.split("/").pop() ?? key,
		source: chapterModules[key],
	}));
}

/** Concatena todos los capítulos en un único documento Yarn. */
export function buildChapterScript(): string {
	return loadChapterScripts().join("\n");
}
