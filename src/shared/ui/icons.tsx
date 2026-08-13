import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { label: string };

function base(props: Omit<IconProps, "label">) {
	return {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		"aria-hidden": true,
		focusable: false,
		...props,
	};
}

interface IconWrapperProps extends IconProps {
	children: ReactNode;
}

function Icon({ label, children, ...props }: IconWrapperProps) {
	return (
		<svg {...base(props)}>
			<title>{label}</title>
			{children}
		</svg>
	);
}

export function BackIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="m15 18-6-6 6-6" />
		</Icon>
	);
}

export function CameraIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
			<circle cx="12" cy="13" r="3" />
		</Icon>
	);
}

export function SendIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M12 19V5" />
			<path d="m5 12 7-7 7 7" />
		</Icon>
	);
}

export function GalleryIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</Icon>
	);
}

export function InfoIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</Icon>
	);
}

export function ShiftIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="m3 11 9-7 9 7" />
			<path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
		</Icon>
	);
}

export function DeleteIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M3 12h16" />
			<path d="m14 7 5 5-5 5" />
		</Icon>
	);
}

export function ChatIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</Icon>
	);
}
