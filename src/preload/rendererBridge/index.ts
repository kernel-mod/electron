import { contextBridge, ipcRenderer } from "electron";
import rendererIPC from "./rendererIPC";

export { rendererIPC };

const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");

const api = {
	ipc: rendererIPC,
};

if (preloadData.contextIsolation) {
	contextBridge.exposeInMainWorld("kernel", api);
} else {
	// @ts-ignore
	window.kernel = api;
}
