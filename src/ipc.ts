import { ipcMain, session } from "electron";
import fs from "fs";
import path from "path";
import getOgre from "./packageLoader/getOgre";
import getPackagesPath from "./packageLoader/getPackagesPath";

// Set up the IPC to send the data from the InjectedBrowserWindow to the preload.
ipcMain.on("KERNEL_PRELOAD_DATA", (event) => {
	// @ts-ignore
	event.returnValue = event.sender.__KERNEL__;
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

ipcMain.handle("KERNEL_GET_RENDERER_PACKAGES", async (event) => {
	const ogre = getOgre();

	const ogrePaths = [];

	for (const layer of ogre) {
		const layerPaths = [];
		for (const packageID of Object.keys(layer)) {
			const rendererPath = path.join(
				getPackagesPath(),
				packageID,
				"renderer.js"
			);
			if (fs.existsSync(rendererPath)) {
				layerPaths.push(rendererPath);
			}
		}
		ogrePaths.push(layerPaths);
	}

	return ogrePaths;
});

ipcMain.on("KERNEL_GET_PRELOAD_PACKAGES", async (event) => {
	event.returnValue = getOgre();
});
