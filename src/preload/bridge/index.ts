declare global {
	const kernel: typeof api;
	interface Window {
		kernel: typeof kernel;
	}
}

import { contextBridge, ipcRenderer } from "electron";
import packages from "./packages";
import broadcast from "#kernel/core/broadcast";

const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

const api = {
	broadcast,
	packages,
	sendFinished: () => {
		return ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK");
	},
	importProtocol: "kernel",
};

if (!!preloadData.windowOptions.webPreferences?.contextIsolation) {
	contextBridge.exposeInMainWorld("kernel", api);
} else {
	window.kernel = api;
}

export default api;
