import { contextBridge, ipcRenderer } from "electron";
import EventListener from "../EventListener";
// import * as packageLoader from "../../core/packageLoader";

const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");

// const packageListener = new EventListener();

// ipcRenderer.on("KERNEL_PACKAGE_START", (event, data) => {
// 	packageListener.emit("start", data);
// });
// ipcRenderer.on("KERNEL_PACKAGE_STOP", (event, data) => {
// 	packageListener.emit("stop", data);
// });

const api = {
	// packageLoader,
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
