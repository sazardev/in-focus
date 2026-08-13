import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import { isTauriRuntime } from "@/shared/persistence/service";

let granted: boolean | null = null;

/** Pide permiso una sola vez. */
async function ensurePermission(): Promise<boolean> {
	if (granted !== null) return granted;
	granted = await isPermissionGranted();
	if (!granted) granted = (await requestPermission()) === "granted";
	return granted;
}

/**
 * Notificación nativa del sistema operativo (bandeja del SO). Solo corre
 * dentro de Tauri; en navegador se ignora (el banner in-app ya avisa).
 * Funciona aunque la ventana esté oculta/cerrada (la app sigue en bandeja).
 */
export async function sendSystemNotification(title: string, body: string): Promise<void> {
	if (!isTauriRuntime()) return;
	try {
		if (await ensurePermission()) sendNotification({ title, body });
	} catch {
		// Sin permiso o no soportado: el banner in-app ya cubre el aviso.
	}
}
