import { describe, expect, it } from "vitest";
import {
	AFFINITY_MAX,
	AFFINITY_MIN,
	applyAffinityDelta,
	clampAffinity,
	resolveAffinityTier,
} from "./calculator";

describe("affinity calculator", () => {
	it("clamps values to the valid range", () => {
		expect(clampAffinity(-10)).toBe(AFFINITY_MIN);
		expect(clampAffinity(150)).toBe(AFFINITY_MAX);
	});

	it("applies deltas without exceeding bounds", () => {
		expect(applyAffinityDelta(95, 10)).toBe(AFFINITY_MAX);
		expect(applyAffinityDelta(5, -10)).toBe(AFFINITY_MIN);
		expect(applyAffinityDelta(40, 5)).toBe(45);
	});

	it("resolves affinity tiers by threshold", () => {
		expect(resolveAffinityTier(0)).toBe("stranger");
		expect(resolveAffinityTier(35)).toBe("friend");
		expect(resolveAffinityTier(70)).toBe("close");
		expect(resolveAffinityTier(90)).toBe("partner");
	});
});
