import type { AffinityTier, RomanceTier, TrustTier } from "@/entities";

/** Ejes de la relación. */
export type RelationshipAxis = "affinity" | "romance" | "trust";

export const AXIS_MIN = 0;
export const AXIS_MAX = 100;

export const AFFINITY_THRESHOLDS: Record<AffinityTier, number> = {
	stranger: 0,
	friend: 20,
	close: 50,
	partner: 80,
};

export const ROMANCE_THRESHOLDS: Record<RomanceTier, number> = {
	cold: 0,
	curious: 20,
	spark: 50,
	love: 80,
};

export const TRUST_THRESHOLDS: Record<TrustTier, number> = {
	guarded: 0,
	wary: 25,
	open: 55,
	safe: 80,
};

export function clampAxis(value: number): number {
	return Math.min(AXIS_MAX, Math.max(AXIS_MIN, value));
}

export function applyAxisDelta(current: number, delta: number): number {
	return clampAxis(current + delta);
}

export function resolveAffinityTier(affinity: number): AffinityTier {
	if (affinity >= AFFINITY_THRESHOLDS.partner) return "partner";
	if (affinity >= AFFINITY_THRESHOLDS.close) return "close";
	if (affinity >= AFFINITY_THRESHOLDS.friend) return "friend";
	return "stranger";
}

export function resolveRomanceTier(romance: number): RomanceTier {
	if (romance >= ROMANCE_THRESHOLDS.love) return "love";
	if (romance >= ROMANCE_THRESHOLDS.spark) return "spark";
	if (romance >= ROMANCE_THRESHOLDS.curious) return "curious";
	return "cold";
}

export function resolveTrustTier(trust: number): TrustTier {
	if (trust >= TRUST_THRESHOLDS.safe) return "safe";
	if (trust >= TRUST_THRESHOLDS.open) return "open";
	if (trust >= TRUST_THRESHOLDS.wary) return "wary";
	return "guarded";
}

export function resolveAxisTier(axis: RelationshipAxis, value: number): string {
	switch (axis) {
		case "affinity":
			return resolveAffinityTier(value);
		case "romance":
			return resolveRomanceTier(value);
		case "trust":
			return resolveTrustTier(value);
	}
}
