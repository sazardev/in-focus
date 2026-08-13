import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
	it("shows the initial when there is no image", () => {
		render(<Avatar name="Maya 📸" />);
		expect(screen.getByLabelText("Maya 📸")).toHaveTextContent("M");
	});

	it("renders an image when src is provided", () => {
		render(<Avatar name="Maya" src="https://example.com/maya.jpg" />);
		const avatar = screen.getByLabelText("Maya");
		expect(avatar.querySelector("img")).toHaveAttribute("src", "https://example.com/maya.jpg");
	});

	it("applies the presence status class", () => {
		render(<Avatar name="Maya" presence="online" />);
		expect(screen.getByLabelText("Maya")).toHaveClass("avatar--status");
	});
});
