declare global {
	const kernel: typeof api;
	interface Window {
		kernel: typeof kernel;
	}
}

import { contextBridge, ipcRenderer } from "electron";
import packages from "./packages";
import broadcast from "#kernel/core/broadcast";
import { patchedRequire } from "#kernel/core/patchers/ImportPatcher";

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
