export type Theme = "light" | "dark" | "system";

export type BaseTone = "terracotta" | "peach" | "sand" | "sunset" | "rose";

export const BASE_TONES: BaseTone[] = ["terracotta", "peach", "sand", "sunset", "rose"];

/** Tamaño global del texto (comodidad). */
export type FontScale = "sm" | "md" | "lg" | "xl";

export const FONT_SCALES: { value: FontScale; label: string }[] = [
	{ value: "sm", label: "Pequeño" },
	{ value: "md", label: "Normal" },
	{ value: "lg", label: "Grande" },
	{ value: "xl", label: "Muy grande" },
];
