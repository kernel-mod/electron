declare global {
	const kernel: typeof api;
	interface Window {
		kernel: typeof kernel;
	}
}

import broadcast from "#kernel/core/broadcast";
import { contextBridge, ipcRenderer } from "electron";
import packages from "./packages";

const api = {
	broadcast,
	packages,
	sendFinished: () => {
		return ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK");
	},
	importProtocol: "kernel",
};

contextBridge.exposeInMainWorld("kernel", api);

export default api;
