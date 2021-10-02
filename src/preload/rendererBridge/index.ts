import { contextBridge, ipcRenderer } from "electron";
import EventListener from "../EventListener";

const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");

const packageListener = new EventListener();

ipcRenderer.on("KERNEL_PACKAGE_START", (event, data) => {
	packageListener.emit("start", data);
});
ipcRenderer.on("KERNEL_PACKAGE_STOP", (event, data) => {
	packageListener.emit("stop", data);
});

const api = {
	packages: {
		getRendererPackages: () =>
			ipcRenderer.sendSync("KERNEL_getRendererPackages"),
		onPackageStart: (callback: (packageName: string) => void) => {
			packageListener.on("start", callback);
		},
		onPackageStop: (callback: (packageName: string) => void) => {
			packageListener.on("stop", callback);
		},
		startPackage: (packageName: string) => {
			ipcRenderer.send("KERNEL_startPackage", packageName);
		},
		stopPackage: (packageName: string) => {
			ipcRenderer.send("KERNEL_stopPackage", packageName);
		},
	},
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
