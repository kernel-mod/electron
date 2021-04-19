const {
	logger,
	utilities: { injectRendererModule },
} = require("../core/global");
logger.log("get preloaded on lmao");
logger.warn("get preloaded on lmao");
logger.error("get preloaded on lmao");

const { ipcRenderer } = require("electron");

ipcRenderer.sendSync('KERNEL_SETUP_RENDERER_HOOK');
injectRendererModule("./renderer/index", true, () => ipcRenderer.sendSync('KERNEL_FINISH_RENDERER_HOOK'));

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");
if (preloadData?.originalPreload) {
	require(preloadData.originalPreload);
}
