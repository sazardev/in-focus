import { useState } from "react";
import type { Pronouns } from "@/entities";
import { BASE_TONES, type BaseTone, useThemeStore } from "@/shared/theme";
import { useProfileStore } from "./store";

const PRONOUN_OPTIONS: { value: Pronouns; label: string }[] = [
	{ value: "he", label: "Él" },
	{ value: "she", label: "Ella" },
	{ value: "neutral", label: "Neutro" },
];

export function Onboarding() {
	const createProfile = useProfileStore((state) => state.createProfile);
	const tone = useThemeStore((state) => state.tone);
	const setTone = useThemeStore((state) => state.setTone);
	const [name, setName] = useState("");
	const [pronouns, setPronouns] = useState<Pronouns>("neutral");

	function submit(event: React.FormEvent) {
		event.preventDefault();
		createProfile({ name, pronouns });
	}

	return (
		<form className="onboarding" onSubmit={submit}>
			<div className="onboarding__card">
				<h1 className="onboarding__title">In Focus</h1>
				<p className="onboarding__intro">Antes de empezar, Maya quiere saber con quién habla.</p>

				<label className="field">
					<span className="field__label">Tu nombre (o apodo)</span>
					<input
						className="field__input"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="ej. Alex"
						maxLength={24}
					/>
				</label>

				<fieldset className="field">
					<legend className="field__label">¿Cómo prefieres que te trate?</legend>
					<div className="field__options">
						{PRONOUN_OPTIONS.map((option) => (
							<label key={option.value} className="choice">
								<input
									type="radio"
									name="pronouns"
									value={option.value}
									checked={pronouns === option.value}
									onChange={() => setPronouns(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						))}
					</div>
					<p className="field__hint">Maya adaptará su lenguaje según tu elección.</p>
				</fieldset>

				<fieldset className="field">
					<legend className="field__label">Tono base de la app</legend>
					<div className="field__options field__tones">
						{BASE_TONES.map((option) => (
							<label key={option} className="tone" aria-label={option}>
								<input
									type="radio"
									name="tone"
									value={option}
									checked={tone === option}
									onChange={() => setTone(option as BaseTone)}
								/>
								<span className={`tone__swatch tone__swatch--${option}`} />
							</label>
						))}
					</div>
					<p className="field__hint">La app y las burbujas adoptan este color cálido.</p>
				</fieldset>

				<button type="submit" className="btn btn--primary onboarding__submit">
					Empezar
				</button>
			</div>
		</form>
	);
}
