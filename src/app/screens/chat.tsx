import { useEffect } from "react";
import { useNavigationStore } from "@/app/navigation";
import { VirtualMessageList } from "@/features/chat/virtual-message-list";
import { useDialogue } from "@/features/dialogue";
import { useFakeTyping } from "@/features/fake-typing";
import { useGameClockStore } from "@/features/game-clock";
import { ExpoCountdown } from "@/features/game-clock/expo-countdown";
import { Avatar, BackIcon, CameraIcon, GalleryIcon, SendIcon } from "@/shared/ui";

const PRESENCE_LABEL = {
	online: "En línea",
	offline: "Desconectada",
	"taking-photos": "Tomando fotos...",
	typing: "Escribiendo...",
};

export function ChatScreen() {
	const navigate = useNavigationStore((state) => state.navigate);
	const {
		messages,
		isMayaTyping,
		mayaPresence,
		chapterTitle,
		mayaAvailability,
		options,
		pendingOption,
		typing,
		confirmSend,
		chooseOption,
		unreadCount,
		markAllRead,
		reactToMessage,
	} = useDialogue();

	// Al elegir una opción, el auto-fill simula el tecleo y envía solo.
	useFakeTyping(confirmSend);

	useEffect(() => {
		markAllRead();
	}, [markAllRead]);

	const isTypingText = typing.status === "typing" || typing.status === "ready-to-send";
	const canSend = typing.isComplete || !isTypingText;
	const gameDay = useGameClockStore((state) => state.day);
	const gameHour = useGameClockStore((state) => state.hour);

	return (
		<div className="chat-shell">
			{chapterTitle ? (
				<div className="chapter-card" role="status">
					<span className="chapter-card__day">Día {gameDay}</span>
					<span className="chapter-card__title">{chapterTitle}</span>
					<span className="chapter-card__clock">{String(gameHour).padStart(2, "0")}:00</span>
				</div>
			) : null}
			<header className="nav-bar">
				<div className="nav-bar__side">
					<button
						type="button"
						className="nav-icon"
						aria-label="Volver"
						onClick={() => navigate("home")}
					>
						<BackIcon label="Volver" width={20} height={20} />
					</button>
					{unreadCount > 0 ? (
						<span
							className="nav-unread"
							role="status"
							aria-label={`${unreadCount} mensajes no leídos`}
						>
							{`< ${unreadCount}`}
						</span>
					) : null}
				</div>
				<div className="nav-bar__title">
					<Avatar name="Maya 📸" size="sm" presence={isMayaTyping ? "typing" : mayaPresence} />
					<div>
						<div className="nav-bar__name">Maya 📸</div>
						<div className="nav-bar__status">
							{isMayaTyping
								? PRESENCE_LABEL.typing
								: mayaAvailability
									? mayaAvailability
									: PRESENCE_LABEL[mayaPresence]}
						</div>
					</div>
				</div>
				<div className="nav-bar__side nav-bar__side--right">
					<button
						type="button"
						className="nav-icon"
						aria-label="Galería"
						onClick={() => navigate("gallery")}
					>
						<GalleryIcon label="Galería" width={20} height={20} />
					</button>
				</div>
			</header>

			<ExpoCountdown />

			<VirtualMessageList
				messages={messages}
				isMayaTyping={isMayaTyping}
				onReact={(messageId, reaction) => {
					if (reaction) reactToMessage(messageId, reaction);
				}}
			/>

			{options ? (
				<div className="option-menu">
					{options.map((option, index) => (
						<button
							key={option.text}
							type="button"
							className="option-btn"
							onClick={() => chooseOption(index)}
						>
							{option.text}
						</button>
					))}
				</div>
			) : pendingOption ? (
				<footer className="input-bar">
					<div className="input-pill">
						<button type="button" className="icon-btn" aria-label="Cámara" disabled>
							<CameraIcon label="Cámara" width={20} height={20} />
						</button>
						<input
							className="input-pill__text"
							aria-label="Mensaje"
							readOnly
							value={typing.filledText}
							placeholder="Escribe un mensaje..."
						/>
					</div>
					<button
						type="button"
						className="send-btn"
						aria-label="Enviar"
						disabled={!canSend}
						onClick={confirmSend}
					>
						<SendIcon label="Enviar" width={18} height={18} />
					</button>
				</footer>
			) : (
				<footer className="input-bar">
					<div className="input-pill">
						<button type="button" className="icon-btn" aria-label="Cámara" disabled>
							<CameraIcon label="Cámara" width={20} height={20} />
						</button>
						<input
							className="input-pill__text"
							aria-label="Mensaje"
							readOnly
							value=""
							placeholder="Mensaje"
						/>
					</div>
					<button type="button" className="send-btn" aria-label="Enviar" disabled>
						<SendIcon label="Enviar" width={18} height={18} />
					</button>
				</footer>
			)}
		</div>
	);
}
