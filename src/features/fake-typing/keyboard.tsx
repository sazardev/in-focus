import { DeleteIcon, ShiftIcon } from "@/shared/ui";
import { useFakeTypingStore } from "./store";

const ROWS = [
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l"],
	["shift", "z", "x", "c", "v", "b", "n", "m", "delete"],
];

interface KeyboardProps {
	onKey?: (key: string) => void;
}

/**
 * Réplica limpia del teclado iOS. En el modo "teclado falso" cada tecla
 * pulsada (sin importar cuál) avanza el auto-fill del mensaje predefinido.
 */
export function Keyboard({ onKey }: KeyboardProps) {
	const pressKey = useFakeTypingStore((state) => state.pressKey);
	const status = useFakeTypingStore((state) => state.status);
	const disabled = status !== "typing";

	function handleKey(key: string) {
		if (disabled) return;
		if (key === "shift" || key === "delete") return;
		pressKey();
		onKey?.(key);
	}

	return (
		<fieldset className="keyboard" aria-label="Teclado virtual">
			{ROWS.map((row) => (
				<div className="keyboard__row" key={row.join("")}>
					{row.map((key) => {
						if (key === "shift") {
							return (
								<button
									type="button"
									key={key}
									className="key key--wide"
									disabled={disabled}
									onClick={() => handleKey(key)}
									aria-label="Shift"
								>
									<ShiftIcon label="Shift" width={18} height={18} />
								</button>
							);
						}
						if (key === "delete") {
							return (
								<button
									type="button"
									key={key}
									className="key key--wide"
									disabled={disabled}
									onClick={() => handleKey(key)}
									aria-label="Borrar"
								>
									<DeleteIcon label="Borrar" width={20} height={20} />
								</button>
							);
						}
						return (
							<button
								type="button"
								key={key}
								className="key"
								disabled={disabled}
								onClick={() => handleKey(key)}
								aria-label={key}
							>
								{key}
							</button>
						);
					})}
				</div>
			))}
			<div className="keyboard__row">
				<button type="button" className="key key--utility" disabled aria-label="Números">
					123
				</button>
				<button type="button" className="key key--space" disabled aria-label="Espacio" />
				<button type="button" className="key key--return" disabled aria-label="Enviar">
					enviar
				</button>
			</div>
		</fieldset>
	);
}
