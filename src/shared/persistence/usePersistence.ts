import { useCallback, useEffect } from "react";
import { useChatStore } from "@/features/chat/store";
import { syncMessageSeq, useDialogueStore } from "@/features/dialogue";
import { useGalleryStore } from "@/features/gallery/store";
import { useProfileStore } from "@/features/profile/store";
import { useRelationshipStore } from "@/features/relationship";
import type { PersistedSaveState } from "./service";
import { deserializeMessage, persistenceService, serializeMessage } from "./service";

function buildState(): PersistedSaveState {
	const profile = useProfileStore.getState().profile;
	const relationship = useRelationshipStore.getState();
	const chat = useChatStore.getState();
	const dialogue = useDialogueStore.getState();
	const gallery = useGalleryStore.getState();

	return {
		profile: profile ? { name: profile.name, pronouns: profile.pronouns } : null,
		affinity: relationship.affinity,
		romance: relationship.romance,
		trust: relationship.trust,
		scriptVariables: dialogue.scriptVariables,
		choiceHistory: dialogue.choiceHistory,
		messages: chat.messages.map(serializeMessage),
		currentNode: dialogue.currentNode,
		chapterTitle: chat.chapterTitle,
		galleryPhotos: gallery.photos.map((p) => p.id),
	};
}

/**
 * Persistencia del progreso (STACK §2.2): hidrata los stores al montar y
 * guarda vía IPC de Rust (o localStorage) cada vez que cambia el estado.
 */
export function usePersistence() {
	const hydrate = useCallback(async () => {
		const state = await persistenceService.load();
		if (!state) return;

		if (state.profile) {
			useProfileStore.getState().createProfile(state.profile);
		}
		useRelationshipStore.setState({
			affinity: state.affinity ?? 0,
			romance: state.romance ?? 0,
			trust: state.trust ?? 0,
		});
		useChatStore.setState({
			messages: state.messages.map(deserializeMessage),
			chapterTitle: state.chapterTitle ?? null,
		});
		useDialogueStore.setState({
			currentNode: state.currentNode,
			scriptVariables: state.scriptVariables ?? {},
			choiceHistory: state.choiceHistory ?? [],
		});
		// Restaura el contador de ids de mensaje para no duplicar claves React.
		syncMessageSeq(useChatStore.getState().messages);
		useGalleryStore.setState({
			photos: state.galleryPhotos.map((id) => ({
				id,
				sourcePath: id,
				takenAt: Date.now(),
				unlocked: true,
			})),
		});
	}, []);

	useEffect(() => {
		void hydrate();
	}, [hydrate]);

	useEffect(() => {
		const save = () => void persistenceService.save(buildState());
		const unsubscribeFns = [
			useProfileStore.subscribe(save),
			useRelationshipStore.subscribe(save),
			useChatStore.subscribe(save),
			useDialogueStore.subscribe(save),
			useGalleryStore.subscribe(save),
		];
		return () => {
			for (const unsubscribe of unsubscribeFns) {
				unsubscribe();
			}
		};
	}, []);
}
