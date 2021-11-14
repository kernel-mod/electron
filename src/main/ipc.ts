import { ipcMain, session } from "electron";
import { kernelPreloadDataSymbol } from "#kernel/core/patchers/ElectronPatcher";

// Set up the IPC to send the data from the InjectedBrowserWindow to the preload.
ipcMain.on("KERNEL_WINDOW_DATA", (event) => {
	event.returnValue = event.sender[kernelPreloadDataSymbol];
});

const senderHooks = new Map();

session.defaultSession.webRequest.onBeforeRequest(
	{ urls: ["*://*/*.js", "*://*/*.html"] },
	(details, callback) => {
		if (senderHooks.has(details.webContentsId)) {
			senderHooks.get(details.webContentsId).reqs.push(() => {
				callback({});
			});
		} else {
			callback({});
		}
	}
);

ipcMain.on("KERNEL_SETUP_RENDERER_HOOK", (event) => {
	const reqs = [];
	const finish = () => {
		reqs.forEach((r) => {
			r();
		});
		senderHooks.delete(event.sender.id);
	};
	senderHooks.set(event.sender.id, {
		finish,
		reqs,
	});
	event.returnValue = true;
});

ipcMain.on("KERNEL_FINISH_RENDERER_HOOK", (event) => {
	senderHooks.get(event.sender.id).finish();
	event.returnValue = true;
});
