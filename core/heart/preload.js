import { ipcRenderer } from "electron";

// ipcMain.

export function beat(vein, data) {
	ipcRenderer.send(`KERNEL_HEART_EVENT_${vein.toUpperCase()}`, data);
}

export function subscribe(vein, callback, once = false) {
	ipcRenderer[once ? "once" : "on"](
		`KERNEL_HEART_EVENT_${vein.toUpperCase()}`,
		callback
	);
}

export function unsubscribe(vein, callback) {
	ipcRenderer.removeListener(vein.toUpperCase(), callback);
}
