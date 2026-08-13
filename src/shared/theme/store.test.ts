import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useThemeStore } from "./store";

describe("theme store", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		useThemeStore.setState({ theme: "light", tone: "terracotta" });
	});

	it("defaults to light theme and terracotta tone", () => {
		expect(useThemeStore.getState().theme).toBe("light");
		expect(useThemeStore.getState().tone).toBe("terracotta");
	});

	it("switches the theme", () => {
		useThemeStore.getState().setTheme("dark");
		expect(useThemeStore.getState().theme).toBe("dark");
		expect(localStorage.getItem("in-focus:theme")).toBe("dark");
	});

	it("toggles between light and dark", () => {
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
