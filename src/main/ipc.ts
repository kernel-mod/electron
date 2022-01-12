import { ipcMain, session } from "electron";
import { kernelPreloadDataSymbol } from "#kernel/core/patchers/ElectronPatcher";

// Set up the IPC to send the data from the InjectedBrowserWindow to the preload.
ipcMain.on("KERNEL_WINDOW_DATA", (event) => {
	// @ts-ignore
	event.returnValue = event.sender.kernelWindowData;
});

const senderHooks = new Map();
let loaded = false;
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
	if (loaded) return (event.returnValue = true);
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
	// No idea what I changed but it now sometimes loads before these hooks are set up.
	// I mean I guess that's good because it means it's fast, but like. What.
	loaded = true;
	senderHooks.get(event.sender.id)?.finish();
	event.returnValue = true;
});
