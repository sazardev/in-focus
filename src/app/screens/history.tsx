import { useState } from "react";
import { useDialogueStore } from "@/features/dialogue";
import { DIARY } from "@/features/diary/data";
import { DiaryEntryCard } from "@/features/diary/diary-entry-card";
import { useGalleryStore } from "@/features/gallery/store";
import {
	useAffinityTier,
	useRelationshipStore,
	useRomanceTier,
	useTrustTier,
} from "@/features/relationship/store";
import { AppScreen } from "./app-screen";

function isChapterUnlocked(
	chapter: number,
	currentChapter: number,
	scriptVariables: Record<string, unknown>,
): boolean {
	if (chapter === 1) return true;
	if (chapter === currentChapter) return true;
	return scriptVariables[`cap_${String(chapter).padStart(2, "0")}_done`] === true;
}

const TIER_LABELS: Record<string, string> = {
	stranger: "Extraños",
	friend: "Amigos",
	close: "Cercanos",
	partner: "Compañeros",
	cold: "Frío",
	curious: "Curiosos",
	spark: "Chispa",
	love: "Enamorados",
	guarded: "Cautelosa",
	wary: "Con dudas",
	open: "Abierta",
	safe: "En confianza",
};

function relationshipStatus(
	romance: string,
	trust: string,
	affinity: string,
): { label: string; tip: string } {
	if (romance === "love") {
		return {
			label: "Enamorados",
			tip: "Están en su mejor momento. La honestidad los trajo hasta aquí.",
		};
	}
	if (romance === "spark") {
		return {
			label: "Hay chispa",
			tip: "Algo crece entre ustedes. Sigue mostrando que te importa.",
		};
	}
	if (trust === "safe" || trust === "open") {
		return {
			label: "Cercanos",
			tip: "Maya se abre contigo. Sé constante: la confianza se cuida.",
		};
	}
	if (affinity === "close" || affinity === "partner") {
		return {
			label: "Conectados",
			tip: "Ya se entienden sin hablar. Las confidencias suman.",
		};
	}
	if (affinity === "friend") {
		return {
			label: "Amigos",
			tip: "Ya no son desconocidos. Cada gesto cuenta.",
		};
	}
	return {
		label: "Conociéndose",
		tip: "Aún se están descubriendo. Pequeños gestos y preguntas suman.",
	};
}

function AxisBar({ label, value, tier }: { label: string; value: number; tier: string }) {
	return (
		<div className="recap__axis">
			<div className="recap__axis-head">
				<span className="recap__axis-label">{label}</span>
				<span className="recap__axis-tier">{TIER_LABELS[tier] ?? tier}</span>
				<span className="recap__axis-value">{value}%</span>
			</div>
			<div
				className="recap__bar"
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div className="recap__bar-fill" style={{ transform: `scaleX(${value / 100})` }} />
			</div>
		</div>
	);
}

export function HistoryScreen() {
	const scriptVariables = useDialogueStore((state) => state.scriptVariables);
	const currentNode = useDialogueStore((state) => state.currentNode);
	const choiceLog = useDialogueStore((state) => state.choiceLog);
	const photoCount = useGalleryStore((state) => state.photos).length;
	const [openChapter, setOpenChapter] = useState<number | null>(null);

	const relationship = useRelationshipStore();
	const affinityTier = useAffinityTier();
	const romanceTier = useRomanceTier();
	const trustTier = useTrustTier();
	const status = relationshipStatus(romanceTier, trustTier, affinityTier);

	const currentChapter = Number(/^Cap(\d+)/.exec(currentNode)?.[1]) ?? 0;
	const chapterTitle = DIARY.find((entry) => entry.chapter === currentChapter)?.title;
	const completed = DIARY.filter(
		(entry) => scriptVariables[`cap_${String(entry.chapter).padStart(2, "0")}_done`] === true,
	).length;

	const choicesByChapter = new Map<number, typeof choiceLog>();
	for (const choice of choiceLog) {
		const list = choicesByChapter.get(choice.chapter) ?? [];
		list.push(choice);
		choicesByChapter.set(choice.chapter, list);
	}

	const summary = [
		`Estás en el capítulo ${currentChapter}${chapterTitle ? ` — ${chapterTitle}` : ""}.`,
		`Llevas ${completed} de ${DIARY.length} capítulos completados y ${choiceLog.length} decisiones tomadas.`,
		status.label === "Enamorados"
			? "Entre ustedes ya no hay 'casi': están enamorados."
			: status.label === "Hay chispa"
				? "Entre ustedes hay chispa, y crece."
				: `Por ahora, ${status.label.toLowerCase()}: ${status.tip.toLowerCase()}`,
		`Has coleccionado ${photoCount} ${photoCount === 1 ? "foto" : "fotos"} en la galería.`,
	].join(" ");

	return (
		<AppScreen title="Historia">
			<div className="history">
				<div className="history__stats">
					<div className="history__stat">
						<span className="history__stat-value">
							{completed}/{DIARY.length}
						</span>
						<span className="history__stat-label">Capítulos</span>
					</div>
					<div className="history__stat">
						<span className="history__stat-value">{choiceLog.length}</span>
						<span className="history__stat-label">Decisiones</span>
					</div>
					<div className="history__stat">
						<span className="history__stat-value">{photoCount}</span>
						<span className="history__stat-label">Fotos</span>
					</div>
				</div>

				<section className="recap">
					<span className="history__section">Cómo vamos</span>
					<div className="recap__axes">
						<AxisBar label="Afinidad" value={relationship.affinity} tier={affinityTier} />
						<AxisBar label="Romance" value={relationship.romance} tier={romanceTier} />
						<AxisBar label="Confianza" value={relationship.trust} tier={trustTier} />
					</div>
					<div className="recap__status">
						<span className="recap__status-label">{status.label}</span>
						<span className="recap__status-tip">{status.tip}</span>
					</div>
				</section>

				<section className="recap">
					<span className="history__section">Resumen del momento</span>
					<p className="recap__summary">{summary}</p>
				</section>

				<span className="history__section">Capítulos</span>
				<ul className="history__chapters">
					{DIARY.map((entry) => {
						const unlocked = isChapterUnlocked(entry.chapter, currentChapter, scriptVariables);
						const open = openChapter === entry.chapter;
						return (
							<li
								key={entry.chapter}
								className={`history__chapter ${unlocked ? "" : "history__chapter--locked"}`}
							>
								<button
									type="button"
									className="history__chapter-head"
									disabled={!unlocked}
									onClick={() => setOpenChapter(open ? null : entry.chapter)}
								>
									<span className="history__chapter-num">
										{String(entry.chapter).padStart(2, "0")}
									</span>
									<span className="history__chapter-title">{entry.title}</span>
									<span className="history__chapter-status" aria-hidden="true">
										{unlocked ? (open ? "▾" : "▸") : "Bloqueado"}
									</span>
								</button>
								{unlocked && open ? (
									<div className="history__entry">
										<DiaryEntryCard
											entry={entry}
											unlocked
											choices={choicesByChapter.get(entry.chapter) ?? []}
										/>
									</div>
								) : null}
							</li>
						);
					})}
				</ul>

				{choiceLog.length > 0 ? (
					<section>
						<span className="history__section">Tus decisiones, por capítulo</span>
						<ul className="history__choices">
							{[...choicesByChapter.entries()].reverse().map(([chapter, choices]) => (
								<li key={chapter} className="history__choice-group">
									<span className="history__choice-chapter">
										Cap. {String(chapter).padStart(2, "0")}
									</span>
									<ul className="history__choice-group-list">
										{choices.map((choice) => (
											<li key={choice.id} className="history__choice-option">
												“{choice.option}”
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
		</AppScreen>
	);
}
