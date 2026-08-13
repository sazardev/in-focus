import { describe, expect, it } from "vitest";
import { useGalleryStore } from "./store";

afterEach(() => {
	useGalleryStore.setState({ photos: [] });
});

describe("gallery store", () => {
	it("agrega fotos", () => {
		useGalleryStore.getState().addPhoto({
			id: "atardecer",
			sourcePath: "https://example.com/a.jpg",
			takenAt: 1,
			unlocked: true,
		});
		expect(useGalleryStore.getState().photos).toHaveLength(1);
	});

	it("desbloquea una foto existente", () => {
		useGalleryStore.getState().addPhoto({
			id: "neon",
			sourcePath: "https://example.com/n.jpg",
			takenAt: 1,
			unlocked: false,
		});
		useGalleryStore.getState().unlockPhoto("neon");
		expect(useGalleryStore.getState().photos[0].unlocked).toBe(true);
	});

	it("reset limpia la colección", () => {
		useGalleryStore.getState().addPhoto({
			id: "luz",
			sourcePath: "https://example.com/l.jpg",
			takenAt: 1,
			unlocked: true,
		});
		useGalleryStore.getState().reset();
		expect(useGalleryStore.getState().photos).toHaveLength(0);
	});
});
