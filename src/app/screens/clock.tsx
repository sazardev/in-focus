import { useClock } from "@/app/os/os-chrome";
import { AppScreen } from "./app-screen";

export function ClockScreen() {
	const now = useClock(1000);
	const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
	const seconds = now.getSeconds();
	const date = now.toLocaleDateString("es-MX", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const hour = now.getHours() % 12;
	const minute = now.getMinutes();
	const hourDeg = hour * 30 + minute * 0.5;
	const minuteDeg = minute * 6 + seconds * 0.1;
	const secondDeg = seconds * 6;

	return (
		<AppScreen title="Reloj">
			<div className="clock">
				<div className="clock__analog">
					<svg
						viewBox="0 0 100 100"
						className="clock__face"
						role="img"
						aria-label="Reloj analógico"
					>
						<circle cx="50" cy="50" r="48" className="clock__rim" />
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
							<line
								key={deg}
								x1="50"
								y1="4"
								x2="50"
								y2={deg % 90 === 0 ? 11 : 9}
								transform={`rotate(${deg} 50 50)`}
								className="clock__tick"
							/>
						))}
						<line
							x1="50"
							y1="50"
							x2="50"
							y2="28"
							transform={`rotate(${hourDeg} 50 50)`}
							className="clock__hand clock__hand--hour"
						/>
						<line
							x1="50"
							y1="50"
							x2="50"
							y2="16"
							transform={`rotate(${minuteDeg} 50 50)`}
							className="clock__hand clock__hand--minute"
						/>
						<line
							x1="50"
							y1="50"
							x2="50"
							y2="12"
							transform={`rotate(${secondDeg} 50 50)`}
							className="clock__hand clock__hand--second"
						/>
						<circle cx="50" cy="50" r="2.5" className="clock__center" />
					</svg>
				</div>
				<div className="clock__digital">
					<span className="clock__time">{time}</span>
					<span className="clock__seconds">{String(seconds).padStart(2, "0")}</span>
				</div>
				<span className="clock__date">{date}</span>
			</div>
		</AppScreen>
	);
}
