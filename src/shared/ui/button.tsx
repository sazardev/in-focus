import type { ComponentProps } from "react";

type ButtonVariant = "default" | "primary" | "ghost";

interface ButtonProps extends ComponentProps<"button"> {
	variant?: ButtonVariant;
}

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
	return <button className={`btn btn--${variant} ${className}`.trim()} {...props} />;
}
