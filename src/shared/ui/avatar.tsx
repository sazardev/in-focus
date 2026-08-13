import type { MayaPresence } from "@/entities";

type AvatarSize = "sm" | "md" | "lg";

const SIZE: Record<AvatarSize, string> = {
	sm: "28px",
	md: "36px",
	lg: "48px",
};

const PRESENCE_COLOR: Record<MayaPresence, string> = {
	online: "var(--presence-online)",
	offline: "var(--presence-offline)",
	"taking-photos": "var(--presence-taking-photos)",
	typing: "var(--presence-typing)",
};

interface AvatarProps {
	name: string;
	src?: string | null;
	size?: AvatarSize;
	presence?: MayaPresence;
}

export function Avatar({ name, src, size = "md", presence }: AvatarProps) {
	const style: Record<string, string> = { "--avatar-size": SIZE[size] };
	const initial = name.trim().charAt(0).toUpperCase();

	if (presence) {
		style["--status-color"] = PRESENCE_COLOR[presence];
	}

	return (
		<span
			role="img"
			aria-label={name}
			className={`avatar ${presence ? "avatar--status" : ""}`}
			style={style}
		>
			{src ? <img src={src} alt={name} decoding="async" /> : initial}
		</span>
	);
}
