import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { DialogueChoice } from "@/features/dialogue/store";
import type { DiaryEntry } from "./data";
import { DiaryEntryCard } from "./diary-entry-card";
import { QUOTES } from "./quotes";

const entry: DiaryEntry = {
	chapter: 1,
	title: "El número en la nota",
	recap: "Encontré una caja con un rollo de fotos.",
	text: "Algo me dijo que debía escribir.",
	note: "Guardé la caja.",
};

const choices: DialogueChoice[] = [
	{ id: "c-1", chapter: 1, option: "Le escribí al número" },
	{ id: "c-2", chapter: 1, option: "Guardé la caja" },
];

afterEach(cleanup);

describe("DiaryEntryCard", () => {
	it("muestra recap, reflexión, nota y frase de Maya de un capítulo desbloqueado", () => {
		render(<DiaryEntryCard entry={entry} unlocked choices={[]} />);
		expect(screen.getByText("Lo que se habló")).toBeTruthy();
		expect(screen.getByText(entry.recap)).toBeTruthy();
		expect(screen.getByText("Reflexión")).toBeTruthy();
		expect(screen.getByText(entry.text)).toBeTruthy();
		expect(screen.getByText("Nota")).toBeTruthy();
		expect(screen.getByText(entry.note)).toBeTruthy();
		expect(screen.getByText((content) => content.includes(QUOTES[0].quote))).toBeTruthy();
	});

	it("lista las decisiones tomadas en el capítulo", () => {
		render(<DiaryEntryCard entry={entry} unlocked choices={choices} />);
		expect(screen.getByText("Tus decisiones")).toBeTruthy();
		for (const choice of choices) {
			expect(screen.getByText(`“${choice.option}”`)).toBeTruthy();
		}
	});

	it("no muestra frase de Maya si el capítulo está bloqueado", () => {
		render(<DiaryEntryCard entry={entry} unlocked={false} choices={[]} />);
		expect(screen.queryByText(/Maya/)).toBeNull();
	});
});
