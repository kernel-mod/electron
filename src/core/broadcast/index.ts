import { ipcMain, ipcRenderer, BrowserWindow } from "electron";
import processLocation from "../utils/processLocation";

const listeners: {
	[id: string]: ((...data: any) => void)[];
} = {};

const broadcast = {
	dispatch(...data: any) {
		const eventID = data.shift();
		listeners[eventID] ??= [];
		for (const listener of listeners[eventID]) {
			try {
				listener(...data);
			} catch (e) {
				console.error(
					`Error in ${processLocation().toLowerCase()} broadcast listener:`,
					e
				);
			}
		}
	},
	emit(id: string, ...args: any[]) {
		switch (processLocation()) {
			case "MAIN":
				return ipcMain.emit("KERNEL_BROADCAST", {}, id, ...args);
			case "PRELOAD":
				return ipcRenderer.sendSync("KERNEL_BROADCAST", id, ...args);
		}
		throw Error(`\`emit\` can't be used in ${processLocation()}.`);
	},
	on(id: string, callback: (...data: any) => void) {
		listeners[id] ??= [];
		listeners[id].push(callback);
	},
	once(id: string, callback: (...data: any) => void) {
		const listener = (...data: any) => {
			broadcast.off(id, listener);
			callback(...data);
		};
		broadcast.on(id, listener);
	},
	off(id: string, callback: (...data: any) => void) {
		if (listeners[id] === undefined) return;
		listeners[id].splice(listeners[id].indexOf(callback), 1);
	},
};

switch (processLocation()) {
	case "MAIN":
		// Send the message down to all the preloads.
		ipcMain.on("KERNEL_BROADCAST", (event, ...data) => {
			broadcast.dispatch(...data);
			try {
				for (const window of BrowserWindow.getAllWindows()) {
					window.webContents.send("KERNEL_BROADCAST", ...data);
				}
			} catch {
				event.returnValue = false;
			}
			event.returnValue = true;
		});
		break;
	case "PRELOAD":
		ipcRenderer.on("KERNEL_BROADCAST", (event, ...data) => {
			broadcast.dispatch(...data);
			event.returnValue = true;
		});
		break;
	default:
		throw Error(`\`broadcast\` can't be used in ${processLocation()}.`);
}

export default broadcast;
