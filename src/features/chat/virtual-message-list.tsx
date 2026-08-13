import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import type { Message } from "@/entities";
import { PhotoBubble } from "@/features/chat/photo-bubble";
import { ChatBubble, TypingIndicator } from "@/shared/ui";

interface VirtualMessageListProps {
	messages: Message[];
	isMayaTyping: boolean;
	onReact: (messageId: string, reaction: Message["reaction"]) => void;
}

function timeOf(sentAt: number): string {
	return new Date(sentAt).toLocaleTimeString("es-MX", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Lista de chat virtualizada (STACK §5.2): solo renderiza los mensajes
 * visibles, manteniendo el uso de memoria bajo tras horas de conversación.
 * Auto-scroll al último mensaje; si el jugador sube, no lo fuerza.
 */
export function VirtualMessageList({ messages, isMayaTyping, onReact }: VirtualMessageListProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const stickToBottom = useRef(true);
	const lastScrollTop = useRef(0);
	const lastPlayerMessageId = useRef<string | null>(null);
	const totalItems = messages.length + (isMayaTyping ? 1 : 0);

	const virtualizer = useVirtualizer({
		count: totalItems,
		getScrollElement: () => parentRef.current,
		// Las fotos son mucho más altas que el texto: estimar bien reduce el
		// re-medido/reflow de la lista al hacer scroll.
		estimateSize: (index) => (messages[index]?.content.kind === "photo" ? 340 : 64),
		overscan: 8,
		measureElement: (element) => element.getBoundingClientRect().height,
	});

	const totalSize = virtualizer.getTotalSize();

	useEffect(() => {
		const element = parentRef.current;
		if (!element) return;
		const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
		if (nearBottom) stickToBottom.current = true;
		void totalItems;
	}, [totalItems]);

	// Scroll suave hasta el fondo REAL: al entrar al chat y cuando llegan
	// mensajes nuevos (si el jugador sigue cerca del final). Se repite al
	// medirse el layout (totalSize) para no dejar ningún hueco abajo. Al
	// enviar un mensaje propio, siempre baja hasta verlo.
	useEffect(() => {
		if (totalItems === 0) return;
		const last = messages[messages.length - 1];
		const justSent = last?.author === "player" && last.id !== lastPlayerMessageId.current;
		if (justSent) lastPlayerMessageId.current = last.id;
		if (!stickToBottom.current && !justSent) return;

		const element = parentRef.current;
		if (!element) return;
		const id = requestAnimationFrame(() => {
			if (stickToBottom.current || justSent) {
				element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
			}
		});
		void totalSize;
		void virtualizer;
		return () => cancelAnimationFrame(id);
	}, [totalItems, totalSize, virtualizer, messages]);

	return (
		<main
			ref={parentRef}
			className="message-canvas"
			onScroll={(event) => {
				const el = event.currentTarget;
				const delta = el.scrollTop - lastScrollTop.current;
				lastScrollTop.current = el.scrollTop;
				const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
				if (delta < -2) {
					// El usuario sube de verdad: se despega del fondo. El scroll
					// automático (suave) nunca dispara esto porque baja.
					stickToBottom.current = false;
				} else if (nearBottom) {
					stickToBottom.current = true;
				}
			}}
		>
			<div
				style={{
					height: virtualizer.getTotalSize(),
					width: "100%",
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualRow) => {
					const messageIndex = virtualRow.index;
					const isTypingRow = messageIndex >= messages.length;
					const message = messages[messageIndex];

					return (
						<div
							key={isTypingRow ? "typing" : message.id}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							className="virtual-row"
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							{isTypingRow ? (
								<div className="message-block message-block--incoming">
									<TypingIndicator />
								</div>
							) : (
								<VirtualMessage
									message={message}
									isBlockEnd={
										messageIndex === messages.length - 1 ||
										messages[messageIndex + 1].author !== message.author
									}
									onReact={(reaction) => onReact(message.id, reaction)}
								/>
							)}
						</div>
					);
				})}
			</div>
		</main>
	);
}

function VirtualMessage({
	message,
	isBlockEnd,
	onReact,
}: {
	message: Message;
	isBlockEnd: boolean;
	onReact: (reaction: Message["reaction"]) => void;
}) {
	const isOwn = message.author === "player";
	const timestamp = timeOf(message.sentAt);

	return (
		<div className={`message-block message-block--${isOwn ? "own" : "incoming"}`}>
			{message.content.kind === "photo" ? (
				<PhotoBubble
					message={message}
					isBlockEnd={isBlockEnd}
					timestamp={timestamp}
					onReact={onReact}
				/>
			) : (
				<ChatBubble
					content={message.content}
					isOwn={isOwn}
					hasTail={isBlockEnd}
					timestamp={timestamp}
					status={message.status}
				/>
			)}
		</div>
	);
}
