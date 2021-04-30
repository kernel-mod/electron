import logger from "kernel/logger";
import { injectRendererModule } from "kernel/utilities";
import { ipcRenderer } from "electron";

import * as heart from "kernel/heart/preload";

heart.subscribe("TEST", (...data) => {
	console.log(...data);
});

logger.log("get preloaded on lmao");
logger.warn("get preloaded on lmao");
logger.error("get preloaded on lmao");

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");
injectRendererModule({
	path: "./renderer",
	onload: () => ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK"),
});

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");
if (preloadData?.originalPreload) {
	require(preloadData.originalPreload);
}
