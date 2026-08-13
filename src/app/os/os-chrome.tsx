import { type SVGProps, useEffect, useState } from "react";

/* ════════════ Chrome del SO simulado (relojes, widgets, iconos de estado) ════════════ */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 14, children, ...rest }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...rest}
		>
			{children}
		</svg>
	);
}

export function AppleLogo({ size = 16 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M17.1 12.5c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.2 1-4.1 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.4 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.9-4z" />
			<path d="M14.3 5.2c.7-.9 1.2-2.1 1.1-3.3-1.1.1-2.4.7-3.2 1.7-.7.9-1.4 2.1-1.2 3.4 1.2.1 2.5-.7 3.3-1.8z" />
		</svg>
	);
}

export function WifiGlyph(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
		</Icon>
	);
}

export function BatteryGlyph(props: IconProps) {
	return (
		<Icon {...props}>
			<rect x="3" y="9" width="16" height="7" rx="2" />
			<path d="M22 11v3" />
		</Icon>
	);
}

export function ControlCenterGlyph(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
		</Icon>
	);
}

export function SpotlightGlyph(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx="11" cy="11" r="7" />
			<path d="m21 21-4-4" />
		</Icon>
	);
}

export function TrashGlyph(props: IconProps) {
	return (
		<Icon {...props}>
			<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
			<path d="M10 11v6M14 11v6" />
		</Icon>
	);
}

function useClock(intervalMs: number): Date {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), intervalMs);
		return () => clearInterval(id);
	}, [intervalMs]);
	return now;
}

export { useClock };

/** Reloj del sistema: hora + fecha (widget grande o compacto). */
export function ClockWidget({ large = false }: { large?: boolean }) {
	const now = useClock(large ? 1000 : 1000);
	const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
	const date = now.toLocaleDateString("es-MX", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
	const title = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
	return (
		<div className={`os-widget os-widget--clock ${large ? "os-widget--large" : ""}`}>
			{large ? (
				<span className="os-widget__weekday">{title}</span>
			) : (
				<span className="os-widget__date">{date}</span>
			)}
			<span className="os-widget__time">{time}</span>
		</div>
	);
}

/** Widget calendario: mes + día destacado. */
export function CalendarWidget() {
	const now = useClock(60_000);
	const month = now.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
	const day = now.getDate();
	const weekday = now.toLocaleDateString("es-MX", { weekday: "long" });
	return (
		<div className="os-widget os-widget--calendar">
			<span className="os-widget__month">{month}</span>
			<span className="os-widget__day">{day}</span>
			<span className="os-widget__weekday">{weekday}</span>
		</div>
	);
}
