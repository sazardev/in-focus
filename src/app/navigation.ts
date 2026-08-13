import { create } from "zustand";

export type Screen = "home" | "chat" | "gallery" | "settings";

interface NavigationState {
	screen: Screen;
	navigate: (screen: Screen) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
	screen: "home",
	navigate: (screen) => set({ screen }),
}));
