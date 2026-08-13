import { create } from "zustand";
import { useRelationshipStore } from "@/features/relationship/store";

interface AffinityState {
	affinity: number;
	addDelta: (delta: number) => void;
	reset: () => void;
}

/**
 * Capa de compatibilidad: el eje único de afinidad ahora vive en el store
 * multieje `useRelationshipStore` (STORY.md §3). Mantiene la API anterior
 * para no romper la persistencia ni los imports existentes.
 */
export const useAffinityStore = create<AffinityState>((set) => ({
	affinity: 0,

	addDelta: (delta) => {
		useRelationshipStore.getState().addDelta("affinity", delta);
		set({ affinity: useRelationshipStore.getState().affinity });
	},

	reset: () => {
		useRelationshipStore.getState().setAxis("affinity", 0);
		set({ affinity: 0 });
	},
}));

export function useAffinityTier() {
	return useRelationshipStore((state) =>
		state.affinity >= 80
			? "partner"
			: state.affinity >= 50
				? "close"
				: state.affinity >= 20
					? "friend"
					: "stranger",
	);
}
