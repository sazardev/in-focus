import type { AffinityTier } from "@/entities";
import {
	AFFINITY_THRESHOLDS,
	AXIS_MAX,
	AXIS_MIN,
	applyAxisDelta,
	clampAxis,
	resolveAffinityTier as resolveTier,
} from "@/features/relationship";

/** Deprecated: usa `features/relationship`. Mantiene la API antigua. */
export const AFFINITY_THRESHOLDS_DEPRECATED: Record<AffinityTier, number> = AFFINITY_THRESHOLDS;

export const AFFINITY_MIN = AXIS_MIN;
export const AFFINITY_MAX = AXIS_MAX;

export function clampAffinity(value: number): number {
	return clampAxis(value);
}

export function resolveAffinityTier(affinity: number): AffinityTier {
	return resolveTier(affinity);
}

export function applyAffinityDelta(current: number, delta: number): number {
	return applyAxisDelta(current, delta);
}
