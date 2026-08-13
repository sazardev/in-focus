import { useNavigationStore } from "@/app/navigation";
import { ChatScreen } from "@/app/screens/chat";
import { GalleryScreen } from "@/app/screens/gallery";
import { HomeScreen } from "@/app/screens/home";
import { SettingsScreen } from "@/app/screens/settings";
import { NotificationStack } from "@/features/notifications";
import { Onboarding, useProfileStore } from "@/features/profile";
import { useDeviceKind } from "@/shared/hooks/device";
import { usePersistence } from "@/shared/persistence";
import "./showcase.css";

function DeviceStatusBar() {
	return (
		<div className="status-bar" aria-hidden="true">
			<span className="status-bar__time">9:41</span>
			<span className="status-bar__island" />
			<span className="status-bar__icons">
				<span className="status-bar__signal" />
				<span className="status-bar__battery" />
			</span>
		</div>
	);
}

export function App() {
	const profile = useProfileStore((state) => state.profile);
	const screen = useNavigationStore((state) => state.screen);
	const device = useDeviceKind();
	usePersistence();

	if (!profile) {
		return <Onboarding />;
	}

	return (
		<div className={`app-shell app-shell--${device}`}>
			<div className={`device device--${device}`}>
				<div className="device__screen">
					{device !== "laptop" ? <DeviceStatusBar /> : null}
					<div className="phone-frame">
						{screen === "home" ? <HomeScreen /> : null}
						{screen === "chat" ? <ChatScreen /> : null}
						{screen === "gallery" ? <GalleryScreen /> : null}
						{screen === "settings" ? <SettingsScreen /> : null}
					</div>
				</div>
				{device === "laptop" ? (
					<div className="laptop-deck" aria-hidden="true">
						<div className="laptop-deck__trackpad" />
					</div>
				) : null}
			</div>
			<NotificationStack />
		</div>
	);
}
