import type { ReactNode } from "react";
import { useNavigationStore } from "@/app/navigation";
import { BackIcon } from "@/shared/ui";

/** Pantalla de app del sistema con barra de navegación estándar (Volver + título). */
export function AppScreen({ title, children }: { title: string; children: ReactNode }) {
	const navigate = useNavigationStore((state) => state.navigate);

	return (
		<div className="screen">
			<header className="nav-bar">
				<div className="nav-bar__side">
					<button
						type="button"
						className="nav-icon"
						aria-label="Volver"
						onClick={() => navigate("home")}
					>
						<BackIcon label="Volver" width={20} height={20} />
					</button>
				</div>
				<div className="nav-bar__title">
					<span className="nav-bar__name">{title}</span>
				</div>
				<div className="nav-bar__side" />
			</header>
			<main className="screen__body">{children}</main>
		</div>
	);
}
