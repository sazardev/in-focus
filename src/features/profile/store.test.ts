import { afterEach, describe, expect, it } from "vitest";
import { sanitizeName, sanitizePronouns, useProfileStore } from "./store";

afterEach(() => {
	localStorage.clear();
	useProfileStore.setState({ profile: null });
});

describe("profile store", () => {
	it("crea un perfil con nombre y pronombres", () => {
		const profile = useProfileStore.getState().createProfile({ name: "Alex", pronouns: "she" });
		expect(profile.name).toBe("Alex");
		expect(profile.pronouns).toBe("she");
		expect(profile.id).toBeTruthy();
		expect(useProfileStore.getState().profile).toEqual(profile);
	});

	it("persiste el perfil en localStorage", () => {
		useProfileStore.getState().createProfile({ name: "Dani", pronouns: "he" });
		const stored = JSON.parse(localStorage.getItem("in-focus:profile") ?? "{}");
		expect(stored.name).toBe("Dani");
		expect(stored.pronouns).toBe("he");
	});

	it("sanitiza el nombre (trim, colapsa espacios, limita longitud)", () => {
		expect(sanitizeName("   Hola   Mundo  ")).toBe("Hola Mundo");
		expect(sanitizeName("x".repeat(60)).length).toBe(24);
		expect(sanitizeName("   ")).toBe("");
	});

	it("resuelve pronombres inválidos a neutro", () => {
		expect(sanitizePronouns("he")).toBe("he");
		expect(sanitizePronouns("she")).toBe("she");
		expect(sanitizePronouns("neutral")).toBe("neutral");
		expect(sanitizePronouns("it")).toBe("neutral");
	});

	it("actualiza los pronombres del perfil existente", () => {
		useProfileStore.getState().createProfile({ name: "Moi", pronouns: "neutral" });
		useProfileStore.getState().updatePronouns("she");
		expect(useProfileStore.getState().profile?.pronouns).toBe("she");
	});

	it("reset elimina el perfil y su persistencia", () => {
		useProfileStore.getState().createProfile({ name: "Moi", pronouns: "neutral" });
		useProfileStore.getState().reset();
		expect(useProfileStore.getState().profile).toBeNull();
		expect(localStorage.getItem("in-focus:profile")).toBeNull();
	});
});
