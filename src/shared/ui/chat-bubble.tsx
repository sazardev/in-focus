import { memo } from "react";
import type { MessageContent, MessageStatus, PhotoReaction } from "@/entities";

interface ChatBubbleProps {
	content: MessageContent;
	isOwn: boolean;
	hasTail?: boolean;
	timestamp?: string;
	/** Confirmación de lectura (solo mensajes propios, estilo iMessage). */
	status?: MessageStatus;
	/** Reacción del jugador a una foto. */
	reaction?: PhotoReaction | null;
}

function ReadReceipt({ status }: { status: MessageStatus }) {
	if (status === "read") {
		return (
			<span className="bubble-receipt" role="img" aria-label="Leído">
				<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
					<path
						d="m2 13 4 4 8-9"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="m9.5 13.5 4 4 8.5-9.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity="0.55"
					/>
				</svg>
			</span>
		);
	}
	if (status === "delivered") {
		return (
			<span className="bubble-receipt" role="img" aria-label="Entregado">
				<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
					<path
						d="m2 13 4 4 8-9"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		);
	}
	return null;
}

function ReactionBadge({ reaction }: { reaction: PhotoReaction }) {
	return (
		<span
			className="bubble-reaction"
			role="img"
			aria-label={reaction === "like" ? "Me gusta" : "Me encanta"}
		>
			{reaction === "like" ? "👍" : "❤️"}
		</span>
	);
}

export const ChatBubble = memo(function ChatBubble({
	content,
	isOwn,
	hasTail = false,
	timestamp,
	status,
	reaction,
}: ChatBubbleProps) {
	const className = [
		"bubble",
		isOwn ? "bubble--own" : "bubble--incoming",
		hasTail ? "bubble--tail" : "",
		content.kind === "photo" ? "bubble--photo" : "",
	]
		.filter(Boolean)
		.join(" ");

	const meta = timestamp ? <span className="bubble-time">{timestamp}</span> : null;
	const receipt = isOwn && status ? <ReadReceipt status={status} /> : null;

	if (content.kind === "photo") {
		return (
			<div className={className}>
				<img src={content.photoId} alt="Foto compartida" loading="lazy" decoding="async" />
				{reaction ? <ReactionBadge reaction={reaction} /> : null}
				<span className="bubble-meta">
					{meta}
					{receipt}
				</span>
			</div>
		);
	}

	return (
		<div className={className}>
			{content.text}
			<span className="bubble-meta">
				{meta}
				{receipt}
			</span>
		</div>
	);
});
