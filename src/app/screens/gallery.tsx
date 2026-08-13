import { useNavigationStore } from "@/app/navigation";
import { GalleryView } from "@/features/gallery";
import { BackIcon } from "@/shared/ui";

export function GalleryScreen() {
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
					<span className="nav-bar__name">Galería</span>
				</div>
				<div className="nav-bar__side" />
			</header>
			<main className="screen__body">
				<GalleryView />
			</main>
		</div>
	);
}
