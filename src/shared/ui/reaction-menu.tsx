import type { PhotoReaction } from "@/entities";

interface ReactionMenuProps {
	onSelect: (reaction: PhotoReaction) => void;
	onClose: () => void;
}

/**
 * Menú de reacciones estilo iMessage que aparece al presionar largo una foto.
 */
export function ReactionMenu({ onSelect, onClose }: ReactionMenuProps) {
	return (
		<div className="reaction-menu" role="menu" aria-label="Reaccionar a la foto">
			<button
				type="button"
				role="menuitem"
				className="reaction-menu__item"
				onClick={() => onSelect("love")}
				aria-label="Me encanta"
			>
				❤️
			</button>
			<button
				type="button"
				role="menuitem"
				className="reaction-menu__item"
				onClick={() => onSelect("like")}
				aria-label="Me gusta"
			>
				👍
			</button>
			<button
				type="button"
				role="menuitem"
				className="reaction-menu__item reaction-menu__item--close"
				onClick={onClose}
				aria-label="Cerrar"
			>
				✕
			</button>
		</div>
	);
}
