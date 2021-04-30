import { ipcMain, BrowserWindow } from "electron";

function routeWrapper(callabck) {
	return ({ vein, data } = { vein: "", data: {} }) => {
		for (const window of BrowserWindow.getAllWindows()) {
			window.webContents.send(`KERNEL_HEART_EVENT_${vein.toUpperCase()}`, data);
		}
	};
}
// ipcMain.

export function beat({ vein, data } = { vein: "", data: {} }) {
	for (const window of BrowserWindow.getAllWindows()) {
		window.webContents.send(`KERNEL_HEART_EVENT_${vein.toUpperCase()}`, data);
	}
	// ipcMain.
}

export function subscribe(vein, callback, once = false) {
	ipcMain[once ? "once" : "on"](
		`KERNEL_HEART_EVENT_${vein.toUpperCase()}`,
		callback
	);
}

export function unsubscribe(vein, callback) {
	ipcMain.removeListener(vein.toUpperCase(), callback);
}
