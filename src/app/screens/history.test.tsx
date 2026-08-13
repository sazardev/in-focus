import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HistoryScreen } from "@/app/screens/history";
import { useRelationshipStore } from "@/features/relationship/store";

afterEach(cleanup);

describe("HistoryScreen (recopilado)", () => {
	beforeEach(() => {
		window.localStorage.clear();
		useRelationshipStore.getState().reset();
	});

	it("muestra el estado de la relación en tiempo real", () => {
		render(<HistoryScreen />);
		expect(screen.getByText("Cómo vamos")).toBeTruthy();
		expect(screen.getByText("Afinidad")).toBeTruthy();
		expect(screen.getByText("Romance")).toBeTruthy();
		expect(screen.getByText("Confianza")).toBeTruthy();
		expect(screen.getByText("Conociéndose")).toBeTruthy();
	});

	it("muestra el resumen del momento y los capítulos", () => {
		render(<HistoryScreen />);
		expect(screen.getByText("Resumen del momento")).toBeTruthy();
		expect(screen.getAllByText("Capítulos").length).toBeGreaterThan(0);
		expect(screen.getByText("El número en la nota")).toBeTruthy();
	});

	it("actualiza el valor de confianza según el store", () => {
		useRelationshipStore.getState().addDelta("trust", 40);
		render(<HistoryScreen />);
		expect(screen.getByText("40%")).toBeTruthy();
		expect(screen.getByText("Con dudas")).toBeTruthy();
	});
});
