import type { ComponentType, CSSProperties } from "react";
import type { SFIconProps } from "sf-symbols-lib";
import {
	SFBookClosedFill,
	SFBubblesAndSparkles,
	SFCalendar,
	SFCameraFill,
	SFClock,
	SFGearshapeFill,
	SFMusicNote,
	SFPhotoOnRectangleAngled,
	SFPhotoStack,
	SFTextRectanglePage,
} from "sf-symbols-lib/dualtone";

type SfGlyph = ComponentType<SFIconProps>;

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
	glyph: SfGlyph;
	glyphColor: string;
	tileFrom: string;
	tileTo: string;
	border?: string;
}

const SPEC: Record<AppKind, IconSpec> = {
	messages: {
		glyph: SFBubblesAndSparkles,
		glyphColor: "#ffffff",
		tileFrom: "#42d86b",
		tileTo: "#19a844",
	},
	gallery: {
		glyph: SFPhotoStack,
		glyphColor: "#ffffff",
		tileFrom: "#8f6af0",
		tileTo: "#6948d3",
	},
	photos: {
		glyph: SFPhotoOnRectangleAngled,
		glyphColor: "#3d7bd9",
		tileFrom: "#ffffff",
		tileTo: "#eef0f4",
		border: "#d8dbe3",
	},
	history: {
		glyph: SFBookClosedFill,
		glyphColor: "#ffffff",
		tileFrom: "#8e7cc3",
		tileTo: "#5b4a9e",
	},
	notes: {
		glyph: SFTextRectanglePage,
		glyphColor: "#ffffff",
		tileFrom: "#fcd859",
		tileTo: "#e6b53a",
	},
	calendar: {
		glyph: SFCalendar,
		glyphColor: "#ff3b30",
		tileFrom: "#ffffff",
		tileTo: "#f0f1f5",
		border: "#d8dbe3",
	},
	clock: {
		glyph: SFClock,
		glyphColor: "#ffffff",
		tileFrom: "#333338",
		tileTo: "#0d0d0f",
	},
	music: {
		glyph: SFMusicNote,
		glyphColor: "#ffffff",
		tileFrom: "#fb5f7e",
		tileTo: "#ee2d55",
	},
	camera: {
		glyph: SFCameraFill,
		glyphColor: "#ffffff",
		tileFrom: "#45454b",
		tileTo: "#19191d",
	},
	settings: {
		glyph: SFGearshapeFill,
		glyphColor: "#3f3f44",
		tileFrom: "#d9d9de",
		tileTo: "#aeb0b6",
	},
};

/**
 * Iconos de app estilo iOS/macOS: tile "squircle" con gradiente + glifos
 * reales de Apple SF Symbols (sf-symbols-lib). Cero arte dibujado a mano.
 */
export function AppGlyph({ kind, size = 64 }: { kind: AppKind; size?: number }) {
	const { glyph: Glyph, glyphColor, tileFrom, tileTo, border } = SPEC[kind];
	const glyphSize = Math.round(size * 0.46);
	const glyphStyle: CSSProperties = { width: glyphSize, height: glyphSize };
	return (
		<span
			className="app-glyph"
			style={{ position: "relative", display: "block", width: "100%", height: "100%" }}
		>
			<svg width="100%" height="100%" viewBox="0 0 64 64" role="img" aria-hidden="true">
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
			</svg>
			<span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
				<Glyph size={glyphSize} color={glyphColor} style={glyphStyle} />
			</span>
		</span>
	);
}
