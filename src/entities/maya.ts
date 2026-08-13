export type MayaPresence = "online" | "offline" | "taking-photos" | "typing";

export interface MayaState {
	presence: MayaPresence;
	affinity: number;
	romance: number;
	trust: number;
}

/** Tier del eje de afinidad (compañerismo). */
export type AffinityTier = "stranger" | "friend" | "close" | "partner";

/** Tier del eje de romance. */
export type RomanceTier = "cold" | "curious" | "spark" | "love";

/** Tier del eje de confianza. */
export type TrustTier = "guarded" | "wary" | "open" | "safe";
