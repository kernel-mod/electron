const { logger } = require("../core/global");
logger.log("get preloaded on lmao");
logger.warn("get preloaded on lmao");
logger.error("get preloaded on lmao");

const { ipcRenderer } = require("electron");

const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");
if (preloadData) {
	require(preloadData.originalPreload);
}
