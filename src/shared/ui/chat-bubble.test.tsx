import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatBubble } from "./chat-bubble";

describe("ChatBubble", () => {
	it("renders text content", () => {
		render(<ChatBubble content={{ kind: "text", text: "Hola" }} isOwn={false} />);
		expect(screen.getByText("Hola")).toBeInTheDocument();
	});

	it("applies own styling for outgoing messages", () => {
		render(<ChatBubble content={{ kind: "text", text: "Mio" }} isOwn={true} />);
		expect(screen.getByText("Mio")).toHaveClass("bubble--own");
	});

	it("applies the tail class when configured", () => {
		render(<ChatBubble content={{ kind: "text", text: "Con cola" }} isOwn={false} hasTail />);
		expect(screen.getByText("Con cola")).toHaveClass("bubble--tail");
	});

	it("renders the timestamp inside the bubble", () => {
		render(<ChatBubble content={{ kind: "text", text: "Hola" }} isOwn={false} timestamp="14:02" />);
		expect(screen.getByText("14:02")).toHaveClass("bubble-time");
	});

	it("renders a photo bubble without a frame", () => {
		render(<ChatBubble content={{ kind: "photo", photoId: "/maya.jpg" }} isOwn={false} />);
		expect(screen.getByRole("img")).toHaveAttribute("src", "/maya.jpg");
		expect(screen.getByRole("img").parentElement).toHaveClass("bubble--photo");
	});
});
