export type Pronouns = "he" | "she" | "neutral";

export interface UserProfile {
	id: string;
	name: string;
	pronouns: Pronouns;
	avatarUrl: string | null;
	createdAt: number;
}
