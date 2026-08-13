import { useNavigationStore } from "@/app/navigation";
import { ChatScreen } from "@/app/screens/chat";
import { GalleryScreen } from "@/app/screens/gallery";
import { HomeScreen } from "@/app/screens/home";
import { SettingsScreen } from "@/app/screens/settings";
import { NotificationStack } from "@/features/notifications";
import { Onboarding, useProfileStore } from "@/features/profile";
import { usePersistence } from "@/shared/persistence";
import "./showcase.css";

export function App() {
	const profile = useProfileStore((state) => state.profile);
	const screen = useNavigationStore((state) => state.screen);
	usePersistence();

	if (!profile) {
		return <Onboarding />;
	}

	return (
		<div className="app-shell">
			<div className="phone-frame">
				{screen === "home" ? <HomeScreen /> : null}
				{screen === "chat" ? <ChatScreen /> : null}
				{screen === "gallery" ? <GalleryScreen /> : null}
				{screen === "settings" ? <SettingsScreen /> : null}
			</div>
			<NotificationStack />
		</div>
	);
}
