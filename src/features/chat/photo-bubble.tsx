import { memo, useState } from "react";
import type { Message } from "@/entities";
import { useLongPress } from "@/shared/hooks/useLongPress";
import { ChatBubble, ReactionMenu } from "@/shared/ui";

interface PhotoBubbleProps {
	message: Message;
	isBlockEnd: boolean;
	timestamp: string;
	onReact: (reaction: Message["reaction"]) => void;
}

/**
 * Burbuja de foto con presión larga para reaccionar (Me gusta / Me encanta).
 */
export const PhotoBubble = memo(function PhotoBubble({
	message,
	isBlockEnd,
	timestamp,
	onReact,
}: PhotoBubbleProps) {
	const [open, setOpen] = useState(false);
	const longPress = useLongPress<HTMLDivElement>({
		onLongPress: () => setOpen(true),
		threshold: 450,
	});

	return (
		<div className="message-bubble-wrap">
			{open ? (
				<ReactionMenu
					onSelect={(reaction) => {
						onReact(reaction);
						setOpen(false);
					}}
					onClose={() => setOpen(false)}
				/>
			) : null}
			<ChatBubble
				content={message.content}
				isOwn={message.author === "player"}
				hasTail={isBlockEnd}
				timestamp={timestamp}
				status={message.status}
				reaction={message.reaction}
				{...longPress}
			/>
		</div>
	);
});
