import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/features/chat/store";
import { useFakeTypingStore } from "@/features/fake-typing/store";
import { useDialogueStore } from "./store";

/**
 * Conecta el estado del diálogo con el chat y el teclado falso para que la
 * UI consuma mensajes, opciones, typing de Maya y estado de escritura.
 */
export function useDialogue() {
	const messages = useChatStore((state) => state.messages);
	const isMayaTyping = useChatStore((state) => state.isMayaTyping);
	const mayaPresence = useChatStore((state) => state.mayaPresence);
	const chapterTitle = useChatStore((state) => state.chapterTitle);
	const mayaAvailability = useChatStore((state) => state.mayaAvailability);
	const unreadCount = messages.filter((m) => m.author === "maya" && m.status !== "read").length;
	const markAllRead = useChatStore((state) => state.markAllRead);
	const reactToMessage = useChatStore((state) => state.reactToMessage);

	const started = useDialogueStore((state) => state.started);
	const finished = useDialogueStore((state) => state.finished);
	const options = useDialogueStore((state) => state.options);
	const pendingOption = useDialogueStore((state) => state.pendingOption);
	const start = useDialogueStore((state) => state.start);
	const chooseOption = useDialogueStore((state) => state.chooseOption);
	const confirmSend = useDialogueStore((state) => state.confirmSend);
	const cancelTyping = useDialogueStore((state) => state.cancelTyping);
	const reset = useDialogueStore((state) => state.reset);

	const typing = useFakeTypingStore(
		useShallow((state) => ({
			status: state.status,
			filledText: state.filledText,
			targetText: state.targetText,
			isComplete: state.isComplete,
		})),
	);

	return {
		messages,
		isMayaTyping,
		mayaPresence,
		chapterTitle,
		mayaAvailability,
		unreadCount,
		markAllRead,
		reactToMessage,
		started,
		finished,
		options,
		pendingOption,
		typing,
		start,
		chooseOption,
		confirmSend,
		cancelTyping,
		reset,
	};
}
