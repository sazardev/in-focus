import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "./store";

describe("theme store", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		useThemeStore.setState({ theme: "system", tone: "terracotta" });
	});

	it("defaults to system theme and terracotta tone", () => {
		expect(useThemeStore.getState().theme).toBe("system");
		expect(useThemeStore.getState().tone).toBe("terracotta");
	});

	it("switches the theme", () => {
		useThemeStore.getState().setTheme("dark");
		expect(useThemeStore.getState().theme).toBe("dark");
		expect(localStorage.getItem("in-focus:theme")).toBe("dark");
	});

	it("toggles between light and dark", () => {
		useThemeStore.getState().setTheme("light");
		useThemeStore.getState().toggleTheme();
		expect(useThemeStore.getState().theme).toBe("dark");
		useThemeStore.getState().toggleTheme();
		expect(useThemeStore.getState().theme).toBe("light");
	});

	it("switches the base tone and persists it", () => {
		useThemeStore.getState().setTone("sunset");
		expect(useThemeStore.getState().tone).toBe("sunset");
		expect(localStorage.getItem("in-focus:tone")).toBe("sunset");
	});
});
