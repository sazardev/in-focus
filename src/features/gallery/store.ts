import { create } from "zustand";
import { playPhoto } from "@/shared/sound";

export interface Photo {
	id: string;
	sourcePath: string;
	takenAt: number;
	unlocked: boolean;
}

interface GalleryState {
	photos: Photo[];
	addPhoto: (photo: Photo) => void;
	unlockPhoto: (photoId: string) => void;
	reset: () => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
	photos: [],
	addPhoto: (photo) => {
		playPhoto();
		set((state) => ({ photos: [...state.photos, photo] }));
	},
	unlockPhoto: (photoId) =>
		set((state) => ({
			photos: state.photos.map((photo) =>
				photo.id === photoId ? { ...photo, unlocked: true } : photo,
			),
		})),
	reset: () => set({ photos: [] }),
}));
