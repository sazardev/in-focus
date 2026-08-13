import { useNavigationStore } from "@/app/navigation";
import { useProfileStore } from "@/features/profile";
import { playNotification, useSoundStore } from "@/shared/sound";
import { BASE_TONES, FONT_SCALES, useThemeStore } from "@/shared/theme";
import { useToastStore } from "@/shared/toast/store";
import { Avatar, Button, Switch } from "@/shared/ui";
import { AppScreen } from "./app-screen";

const PRONOUN_LABEL: Record<string, string> = { he: "Él", she: "Ella", neutral: "Neutro" };

function SectionLabel({ children }: { children: string }) {
	return <span className="showcase-panel__label">{children}</span>;
}

export function SettingsScreen() {
	const navigate = useNavigationStore((state) => state.navigate);
	const profile = useProfileStore((state) => state.profile);
	const resetProfile = useProfileStore((state) => state.reset);
	const theme = useThemeStore((state) => state.theme);
	const tone = useThemeStore((state) => state.tone);
	const font = useThemeStore((state) => state.font);
	const setTheme = useThemeStore((state) => state.setTheme);
	const setTone = useThemeStore((state) => state.setTone);
	const setFont = useThemeStore((state) => state.setFont);
	const soundEnabled = useSoundStore((state) => state.enabled);
	const toggleSound = useSoundStore((state) => state.toggleSound);

	return (
		<AppScreen title="Ajustes">
			<div className="settings">
				<section className="settings__group">
					<SectionLabel>Perfil</SectionLabel>
					<div className="settings__row">
						<div className="settings__row-main">
							<Avatar name={profile?.name ?? "?"} size="md" />
							<div>
								<p className="settings__value">
									{profile?.name ?? "—"} · {PRONOUN_LABEL[profile?.pronouns ?? "neutral"]}
								</p>
								<p className="settings__hint">Lo que Maya sabe de ti.</p>
							</div>
						</div>
					</div>
				</section>

				<section className="settings__group">
					<SectionLabel>Apariencia</SectionLabel>
					<div className="settings__row">
						<span className="settings__row-label">Tema</span>
						<div className="settings__row-control">
							<Button
								type="button"
								variant={theme === "system" ? "primary" : "default"}
								onClick={() => setTheme("system")}
							>
								Sistema
							</Button>
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
					<div className="settings__row">
						<span className="settings__row-label">Tono base</span>
						<div className="settings__row-control">
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
					<div className="settings__row">
						<span className="settings__row-label">Texto</span>
						<div className="settings__row-control">
							{FONT_SCALES.map((option) => (
								<Button
									key={option.value}
									type="button"
									variant={font === option.value ? "primary" : "default"}
									onClick={() => {
										setFont(option.value);
										useToastStore.getState().push(`Texto ${option.label.toLowerCase()}`);
									}}
								>
									{option.label}
								</Button>
							))}
						</div>
					</div>
					<p className="settings__hint">Ajusta el tamaño del texto en toda la app.</p>
				</section>

				<section className="settings__group">
					<SectionLabel>Sonido</SectionLabel>
					<div className="settings__row">
						<span className="settings__row-label">Efectos de sonido</span>
						<Switch
							checked={soundEnabled}
							onChange={() => {
								toggleSound();
								useToastStore
									.getState()
									.push(soundEnabled ? "Sonido desactivado" : "Sonido activado");
							}}
							label="Activar efectos de sonido"
						/>
					</div>
					<div className="settings__row">
						<span className="settings__row-label">Prueba</span>
						<Button type="button" variant="ghost" onClick={() => playNotification()}>
							Probar sonido
						</Button>
					</div>
					<p className="settings__hint">Notificaciones, tecleo, envío y fotos con sonido.</p>
				</section>

				<section className="settings__group">
					<SectionLabel>Partida</SectionLabel>
					<div className="settings__row">
						<span className="settings__row-label">Empezar de nuevo</span>
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
			</div>
		</AppScreen>
	);
}
