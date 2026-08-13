import { create } from "zustand";
import type { AffinityTier, RomanceTier, TrustTier } from "@/entities";
import { applyAxisDelta, clampAxis, type RelationshipAxis } from "./calculator";

export interface RelationshipValues {
	affinity: number;
	romance: number;
	trust: number;
}

interface RelationshipState extends RelationshipValues {
	addDelta: (axis: RelationshipAxis, delta: number) => void;
	setAxis: (axis: RelationshipAxis, value: number) => void;
	reset: () => void;
}

function axisValue(state: RelationshipValues, axis: RelationshipAxis): number {
	switch (axis) {
		case "affinity":
			return state.affinity;
		case "romance":
			return state.romance;
		case "trust":
			return state.trust;
	}
}

function axisSetter(axis: RelationshipAxis, value: number): Partial<RelationshipValues> {
	switch (axis) {
		case "affinity":
			return { affinity: value };
		case "romance":
			return { romance: value };
		case "trust":
			return { trust: value };
	}
}

export const useRelationshipStore = create<RelationshipState>((set) => ({
	affinity: 0,
	romance: 0,
	trust: 0,

	addDelta: (axis, delta) =>
		set((state) => axisSetter(axis, applyAxisDelta(axisValue(state, axis), delta))),

	setAxis: (axis, value) => set(() => axisSetter(axis, clampAxis(value))),

	reset: () => set({ affinity: 0, romance: 0, trust: 0 }),
}));

export function useAffinityTier(): AffinityTier {
	return useRelationshipStore((state) => {
		return state.affinity >= 80
			? "partner"
			: state.affinity >= 50
				? "close"
				: state.affinity >= 20
					? "friend"
					: "stranger";
	});
}

export function useRomanceTier(): RomanceTier {
	return useRelationshipStore((state) => {
		return state.romance >= 80
			? "love"
			: state.romance >= 50
				? "spark"
				: state.romance >= 20
					? "curious"
					: "cold";
	});
}

export function useTrustTier(): TrustTier {
	return useRelationshipStore((state) => {
		return state.trust >= 80
			? "safe"
			: state.trust >= 55
				? "open"
				: state.trust >= 25
					? "wary"
					: "guarded";
	});
}
