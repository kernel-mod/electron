import { contextBridge, ipcRenderer } from "electron";
import packages from "./packages";
import broadcast from "../../core/broadcast";

const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

const api = {
	broadcast,
	packages,
	sendFinished: () => {
		return ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK");
	},
};

if (preloadData.contextIsolation) {
	contextBridge.exposeInMainWorld("kernel", api);
} else {
	// @ts-ignore
	window.kernel = api;
}

export default api;
