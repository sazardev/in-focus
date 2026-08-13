import { useState } from "react";
import { useDialogueStore } from "@/features/dialogue";
import { DIARY } from "@/features/diary/data";
import { useGameClockStore } from "@/features/game-clock/store";
import { AppScreen } from "./app-screen";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

const MONTH_NAMES = Array.from({ length: 12 }, (_, m) =>
	new Date(2020, m, 1).toLocaleDateString("es-MX", { month: "long" }),
);

export function CalendarScreen() {
	const realNow = new Date();
	const [cursor, setCursor] = useState({ year: realNow.getFullYear(), month: realNow.getMonth() });
	const currentNode = useDialogueStore((state) => state.currentNode);
	const day = useGameClockStore((state) => state.day);
	const expoDay = useGameClockStore((state) => state.expoDay);

	const today = realNow.getDate();
	const currentChapter = Number(/^Cap(\d+)/.exec(currentNode)?.[1]) ?? 0;
	const chapterTitle = DIARY.find((entry) => entry.chapter === currentChapter)?.title;
	const expoDaysLeft = expoDay == null ? null : expoDay - day;

	const { year, month } = cursor;
	const firstDay = new Date(year, month, 1).getDay();
	const startOffset = (firstDay + 6) % 7; // semana que empieza en lunes
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells: { key: string; day: number | null }[] = [
		...Array.from({ length: startOffset }, (_, i) => ({ key: `pad-${i}`, day: null })),
		...Array.from({ length: daysInMonth }, (_, i) => ({ key: `day-${i + 1}`, day: i + 1 })),
	];
	while (cells.length % 7 !== 0) cells.push({ key: `pad-end-${cells.length}`, day: null });

	const isCurrentMonth = year === realNow.getFullYear() && month === realNow.getMonth();

	function shift(delta: number) {
		const next = new Date(year, month + delta, 1);
		setCursor({ year: next.getFullYear(), month: next.getMonth() });
	}

	return (
		<AppScreen title="Calendario">
			<div className="calendar">
				<div className="calendar__nav">
					<button
						type="button"
						className="calendar__arrow"
						aria-label="Mes anterior"
						onClick={() => shift(-1)}
					>
						‹
					</button>
					<span className="calendar__month">
						{MONTH_NAMES[month]} {year}
					</span>
					<button
						type="button"
						className="calendar__arrow"
						aria-label="Mes siguiente"
						onClick={() => shift(1)}
					>
						›
					</button>
				</div>

				<div className="calendar__weekdays">
					{WEEKDAYS.map((day, index) => (
						<span
							key={day}
							className={`calendar__weekday ${index >= 5 ? "calendar__weekday--weekend" : ""}`}
						>
							{day}
						</span>
					))}
				</div>
				<div className="calendar__grid">
					{cells.map((cell, index) => (
						<span
							key={cell.key}
							className={`calendar__cell ${index % 7 >= 5 ? "calendar__cell--weekend" : ""} ${
								isCurrentMonth && cell.day === today ? "calendar__cell--today" : ""
							}`}
						>
							{cell.day ?? ""}
						</span>
					))}
				</div>

				<div className="calendar__story">
					<div className="calendar__event">
						<span className="calendar__event-label">Historia</span>
						<span className="calendar__event-text">
							{chapterTitle
								? `Capítulo ${currentChapter} — ${chapterTitle}`
								: "La historia aún no comienza"}
						</span>
					</div>
					{expoDaysLeft != null ? (
						<div className="calendar__event calendar__event--expo">
							<span className="calendar__event-label">Exposición</span>
							<span className="calendar__event-text">
								{expoDaysLeft > 0
									? `en ${expoDaysLeft} día${expoDaysLeft === 1 ? "" : "s"}`
									: expoDaysLeft === 0
										? "¡hoy!"
										: "pasó"}
							</span>
						</div>
					) : null}
				</div>
			</div>
		</AppScreen>
	);
}
