export type MessageAuthor = "player" | "maya";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type MessageContent = { kind: "text"; text: string } | { kind: "photo"; photoId: string };

/** Reacción del jugador a una foto (Me gusta / Me encanta). */
export type PhotoReaction = "like" | "love";

export interface Message {
	id: string;
	author: MessageAuthor;
	content: MessageContent;
	sentAt: number;
	status: MessageStatus;
	/** Reacción aplicada por el jugador (presión larga sobre una foto). */
	reaction?: PhotoReaction | null;
}

export type ChatDirection = "incoming" | "outgoing";
