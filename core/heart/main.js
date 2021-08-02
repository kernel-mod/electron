import { ipcMain, BrowserWindow } from "electron";
import EventEmitter from "events";

const emitter = new EventEmitter();

function routeWrapper(callabck) {
	return (vein = "DEV_NULL", data) => {
		for (const window of BrowserWindow.getAllWindows()) {
			window.webContents.send(`KERNEL_HEART_EVENT_${vein}`, data);
		}
	};
}
// ipcMain.

export function beat(vein = "DEV_NULL", data) {
	for (const window of BrowserWindow.getAllWindows()) {
		window.webContents.send(`KERNEL_HEART_EVENT_${vein}`, data);
	}
	emitter.emit(vein, data);
	// ipcMain.
}

export function subscribe(vein, callback, once = false) {
	ipcMain[once ? "once" : "on"](`KERNEL_HEART_EVENT_${vein}`, callback);
	emitter[once ? "once" : "on"](vein, callback);
}

export function unsubscribe(vein, callback) {
	ipcMain.removeListener(vein, callback);
	emitter.removeListener(vein, callback);
}
