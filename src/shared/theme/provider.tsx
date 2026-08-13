import type { ReactNode } from "react";
import { useEffect } from "react";
import { useThemeStore } from "./store";

function systemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const theme = useThemeStore((state) => state.theme);
	const tone = useThemeStore((state) => state.tone);
	const font = useThemeStore((state) => state.font);

	useEffect(() => {
		const root = document.documentElement;
		root.dataset.tone = tone;
		root.dataset.font = font;

		const apply = () => {
			root.dataset.theme = theme === "system" ? systemTheme() : theme;
		};
		apply();

		if (theme === "system") {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			const onChange = () => apply();
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		}
	}, [theme, tone, font]);

	return children;
}
