import { create } from "zustand";
import type { BaseTone, Theme } from "./types";

const THEME_KEY = "in-focus:theme";
const TONE_KEY = "in-focus:tone";

function readStored<T extends string>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	return (localStorage.getItem(key) as T) || fallback;
}

interface ThemeState {
	theme: Theme;
	tone: BaseTone;
	setTheme: (theme: Theme) => void;
	setTone: (tone: BaseTone) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
	theme: readStored<Theme>(THEME_KEY, "light"),
	tone: readStored<BaseTone>(TONE_KEY, "terracotta"),
	setTheme: (theme) => {
		localStorage.setItem(THEME_KEY, theme);
		set({ theme });
	},
	setTone: (tone) => {
		localStorage.setItem(TONE_KEY, tone);
		set({ tone });
	},
	toggleTheme: () => get().setTheme(get().theme === "light" ? "dark" : "light"),
}));
