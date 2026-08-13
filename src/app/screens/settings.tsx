import { useNavigationStore } from "@/app/navigation";
import { useProfileStore } from "@/features/profile";
import { BASE_TONES, useThemeStore } from "@/shared/theme";
import { BackIcon, Button } from "@/shared/ui";

export function SettingsScreen() {
	const navigate = useNavigationStore((state) => state.navigate);
	const profile = useProfileStore((state) => state.profile);
	const resetProfile = useProfileStore((state) => state.reset);
	const theme = useThemeStore((state) => state.theme);
	const tone = useThemeStore((state) => state.tone);
	const setTheme = useThemeStore((state) => state.setTheme);
	const setTone = useThemeStore((state) => state.setTone);

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
					<span className="nav-bar__name">Ajustes</span>
				</div>
				<div className="nav-bar__side" />
			</header>

			<main className="screen__body">
				<section className="settings">
					<div className="settings__group">
						<span className="showcase-panel__label">Perfil</span>
						<p className="settings__value">
							{profile?.name} ·{" "}
							{profile?.pronouns === "he" ? "Él" : profile?.pronouns === "she" ? "Ella" : "Neutro"}
						</p>
					</div>

					<div className="settings__group">
						<span className="showcase-panel__label">Tema</span>
						<div className="showcase-panel__row">
							<Button
								type="button"
								variant={theme === "light" ? "primary" : "default"}
								onClick={() => setTheme("light")}
							>
								Claro
							</Button>
							<Button
								type="button"
								variant={theme === "dark" ? "primary" : "default"}
								onClick={() => setTheme("dark")}
							>
								Oscuro
							</Button>
						</div>
					</div>

					<div className="settings__group">
						<span className="showcase-panel__label">Tono base</span>
						<div className="showcase-panel__row">
							{BASE_TONES.map((option) => (
								<Button
									key={option}
									type="button"
									variant={tone === option ? "primary" : "default"}
									onClick={() => setTone(option)}
								>
									{option}
								</Button>
							))}
						</div>
					</div>

					<div className="settings__group">
						<span className="showcase-panel__label">Partida</span>
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								resetProfile();
								navigate("home");
							}}
						>
							Borrar perfil
						</Button>
					</div>
				</section>
			</main>
		</div>
	);
}
