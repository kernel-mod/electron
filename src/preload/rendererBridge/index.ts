import { contextBridge, ipcRenderer } from "electron";

import { default as ipc } from "./rendererIPC";

const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");

if (preloadData.contextIsolation) {
	contextBridge.exposeInMainWorld("kernel", {
		ipc,
	});
} else {
	// @ts-ignore
	window.kernel = { ipc };
}
