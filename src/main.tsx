import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import { ThemeProvider } from "@/shared/theme";
import "@/shared/styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);
