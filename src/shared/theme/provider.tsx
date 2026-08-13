import type { ReactNode } from "react";
import { useEffect } from "react";
import { useThemeStore } from "./store";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const theme = useThemeStore((state) => state.theme);
	const tone = useThemeStore((state) => state.tone);

	useEffect(() => {
		const root = document.documentElement;
		root.dataset.theme = theme;
		root.dataset.tone = tone;
	}, [theme, tone]);

	return children;
}
