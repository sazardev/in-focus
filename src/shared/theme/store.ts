import { create } from "zustand";
import type { BaseTone, FontScale, Theme } from "./types";

const THEME_KEY = "in-focus:theme";
const TONE_KEY = "in-focus:tone";
const FONT_KEY = "in-focus:font";

function readStored<T extends string>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	return (localStorage.getItem(key) as T) || fallback;
}

interface ThemeState {
	theme: Theme;
	tone: BaseTone;
	font: FontScale;
	setTheme: (theme: Theme) => void;
	setTone: (tone: BaseTone) => void;
	setFont: (font: FontScale) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
	theme: readStored<Theme>(THEME_KEY, "system"),
	tone: readStored<BaseTone>(TONE_KEY, "terracotta"),
	font: readStored<FontScale>(FONT_KEY, "md"),
	setTheme: (theme) => {
		localStorage.setItem(THEME_KEY, theme);
		set({ theme });
	},
	setTone: (tone) => {
		localStorage.setItem(TONE_KEY, tone);
		set({ tone });
	},
	setFont: (font) => {
		localStorage.setItem(FONT_KEY, font);
		set({ font });
	},
	toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));
