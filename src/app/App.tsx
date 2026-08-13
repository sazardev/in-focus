import { useState } from "react";
import { useNavigationStore } from "@/app/navigation";
import { BootScreen } from "@/app/screens/boot";
import { CalendarScreen } from "@/app/screens/calendar";
import { CameraScreen } from "@/app/screens/camera";
import { ChatScreen } from "@/app/screens/chat";
import { ClockScreen } from "@/app/screens/clock";
import { GalleryScreen } from "@/app/screens/gallery";
import { HistoryScreen } from "@/app/screens/history";
import { HomeScreen } from "@/app/screens/home";
import { MusicScreen } from "@/app/screens/music";
import { NotesScreen } from "@/app/screens/notes";
import { SettingsScreen } from "@/app/screens/settings";
import { NotificationStack } from "@/features/notifications";
import { Onboarding, useProfileStore } from "@/features/profile";
import { PerfOverlay } from "@/shared/perf/PerfOverlay";
import { startPerfMeter, useRenderTick } from "@/shared/perf/perf";
import { usePersistence } from "@/shared/persistence";
import { ToastStack } from "@/shared/toast/toast-stack";
import "./showcase.css";

export function App() {
	const [booted, setBooted] = useState(false);
	const profile = useProfileStore((state) => state.profile);
	const screen = useNavigationStore((state) => state.screen);
	usePersistence();
	useRenderTick();
	startPerfMeter();

	if (!booted) {
		return <BootScreen onDone={() => setBooted(true)} />;
	}

	if (!profile) {
		return <Onboarding />;
	}

	return (
		<div className="app-shell">
			<div className="phone-frame app-frame">
				<div key={screen} className="screen-transition">
					{screen === "home" ? <HomeScreen /> : null}
					{screen === "chat" ? <ChatScreen /> : null}
					{screen === "gallery" ? <GalleryScreen /> : null}
					{screen === "history" ? <HistoryScreen /> : null}
					{screen === "settings" ? <SettingsScreen /> : null}
					{screen === "notes" ? <NotesScreen /> : null}
					{screen === "calendar" ? <CalendarScreen /> : null}
					{screen === "clock" ? <ClockScreen /> : null}
					{screen === "music" ? <MusicScreen /> : null}
					{screen === "camera" ? <CameraScreen /> : null}
				</div>
			</div>
			<PerfOverlay />
			<NotificationStack />
			<ToastStack />
		</div>
	);
}
