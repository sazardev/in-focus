import type { DialogueChoice } from "@/features/dialogue/store";
import type { DiaryEntry } from "./data";
import { QUOTES } from "./quotes";

interface DiaryEntryCardProps {
	entry: DiaryEntry;
	unlocked: boolean;
	choices: DialogueChoice[];
}

export function DiaryEntryCard({ entry, unlocked, choices }: DiaryEntryCardProps) {
	const quote = unlocked ? QUOTES.find((q) => q.chapter === entry.chapter)?.quote : undefined;

	return (
		<div className="diary-card">
			<div className="diary-card__block">
				<span className="diary-card__label">Lo que se habló</span>
				<p className="diary-card__text">{entry.recap}</p>
			</div>
			<div className="diary-card__block">
				<span className="diary-card__label">Reflexión</span>
				<p className="diary-card__text">{entry.text}</p>
			</div>
			<div className="diary-card__block">
				<span className="diary-card__label">Nota</span>
				<p className="diary-card__text">{entry.note}</p>
			</div>
			{choices.length > 0 ? (
				<div className="diary-card__block">
					<span className="diary-card__label">Tus decisiones</span>
					<ul className="diary-card__choices">
						{choices.map((choice) => (
							<li key={choice.id} className="diary-card__choice">
								“{choice.option}”
							</li>
						))}
					</ul>
				</div>
			) : null}
			{quote ? <blockquote className="diary-card__quote">“{quote}” — Maya</blockquote> : null}
		</div>
	);
}
