import type { LucideIcon } from "lucide-react";
import {
	BookOpen,
	CalendarDays,
	Camera,
	Clock,
	Flower2,
	Image,
	MessageCircle,
	Music,
	Settings,
	StickyNote,
} from "lucide-react";

export type AppKind =
	| "messages"
	| "gallery"
	| "photos"
	| "notes"
	| "calendar"
	| "clock"
	| "music"
	| "camera"
	| "settings"
	| "history";

interface IconSpec {
	Icon: LucideIcon;
	iconColor: string;
	tileFrom: string;
	tileTo: string;
	border?: string;
}

const SPEC: Record<AppKind, IconSpec> = {
	messages: {
		Icon: MessageCircle,
		iconColor: "#ffffff",
		tileFrom: "#35c759",
		tileTo: "#1b9e40",
	},
	gallery: {
		Icon: Image,
		iconColor: "#ffffff",
		tileFrom: "#a878e4",
		tileTo: "#7a4cc4",
	},
	photos: {
		Icon: Flower2,
		iconColor: "#3d7bd9",
		tileFrom: "#ffffff",
		tileTo: "#eef0f4",
		border: "#d8dbe3",
	},
	history: {
		Icon: BookOpen,
		iconColor: "#ffffff",
		tileFrom: "#8e7cc3",
		tileTo: "#5b4a9e",
	},
	notes: {
		Icon: StickyNote,
		iconColor: "#3a2c0a",
		tileFrom: "#f7d23c",
		tileTo: "#e3b314",
	},
	calendar: {
		Icon: CalendarDays,
		iconColor: "#e23b3b",
		tileFrom: "#ffffff",
		tileTo: "#eef0f4",
		border: "#d8dbe3",
	},
	clock: {
		Icon: Clock,
		iconColor: "#ffffff",
		tileFrom: "#2b2b2e",
		tileTo: "#0f0f11",
	},
	music: {
		Icon: Music,
		iconColor: "#ffffff",
		tileFrom: "#f8647c",
		tileTo: "#ec2d55",
	},
	camera: {
		Icon: Camera,
		iconColor: "#ffffff",
		tileFrom: "#3a3a3d",
		tileTo: "#161618",
	},
	settings: {
		Icon: Settings,
		iconColor: "#ffffff",
		tileFrom: "#b9b9be",
		tileTo: "#85858c",
	},
};

/**
 * Iconos de app estilo iOS/macOS: tile "squircle" con gradiente + glifo real
 * de Lucide (banco de iconos). Imita la apariencia de macOS Sierra.
 */
export function AppGlyph({ kind, size = 64 }: { kind: AppKind; size?: number }) {
	const { Icon, iconColor, tileFrom, tileTo, border } = SPEC[kind];
	const glyphSize = Math.round(size * 0.46);
	return (
		<svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-hidden="true">
			<defs>
				<linearGradient id={`tile-${kind}`} x1="0" y1="0" x2="0.6" y2="1">
					<stop offset="0" stopColor={tileFrom} />
					<stop offset="1" stopColor={tileTo} />
				</linearGradient>
			</defs>
			<rect width="64" height="64" rx="14.5" fill={`url(#tile-${kind})`} />
			{border ? (
				<rect
					x="1"
					y="1"
					width="62"
					height="62"
					rx="13.5"
					fill="none"
					stroke={border}
					strokeWidth="2"
				/>
			) : (
				<rect
					x="0.75"
					y="0.75"
					width="62.5"
					height="62.5"
					rx="13.75"
					fill="none"
					stroke="#ffffff"
					strokeOpacity="0.22"
					strokeWidth="1.5"
				/>
			)}
			<rect x="3" y="2" width="58" height="20" rx="11" fill="#ffffff" fillOpacity="0.12" />
			<Icon
				x={32 - glyphSize / 2}
				y={32 - glyphSize / 2}
				width={glyphSize}
				height={glyphSize}
				color={iconColor}
				strokeWidth={2.1}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
