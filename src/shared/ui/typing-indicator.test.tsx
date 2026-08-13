import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypingIndicator } from "./typing-indicator";

describe("TypingIndicator", () => {
	it("renders the status role with three dots", () => {
		render(<TypingIndicator />);
		const indicator = screen.getByRole("status");
		expect(indicator).toBeInTheDocument();
		expect(indicator.querySelectorAll(".typing-indicator__dot")).toHaveLength(3);
	});

	it("announces the typing state", () => {
		render(<TypingIndicator />);
		expect(screen.getByLabelText("Maya está escribiendo")).toBeInTheDocument();
	});
});
