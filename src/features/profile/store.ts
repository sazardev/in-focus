import { create } from "zustand";
import type { Pronouns, UserProfile } from "@/entities";

const PROFILE_KEY = "in-focus:profile";

function sanitizeName(raw: string): string {
	return raw.trim().replace(/\s+/g, " ").slice(0, 24);
}

function sanitizePronouns(value: string): Pronouns {
	return value === "he" || value === "she" ? value : "neutral";
}

function loadProfile(): UserProfile | null {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem(PROFILE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as UserProfile;
	} catch {
		return null;
	}
}

interface ProfileState {
	profile: UserProfile | null;
	createProfile: (input: { name: string; pronouns: Pronouns }) => UserProfile;
	updatePronouns: (pronouns: Pronouns) => void;
	reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
	profile: loadProfile(),

	createProfile: ({ name, pronouns }) => {
		const profile: UserProfile = {
			id: crypto.randomUUID(),
			name: sanitizeName(name) || "Tú",
			pronouns: sanitizePronouns(pronouns),
			avatarUrl: null,
			createdAt: Date.now(),
		};
		localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
		set({ profile });
		return profile;
	},

	updatePronouns: (pronouns) => {
		const sanitized = sanitizePronouns(pronouns);
		set((state) => {
			if (!state.profile) return state;
			const updated = { ...state.profile, pronouns: sanitized };
			localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
			return { profile: updated };
		});
	},

	reset: () => {
		localStorage.removeItem(PROFILE_KEY);
		set({ profile: null });
	},
}));

export { sanitizeName, sanitizePronouns };
