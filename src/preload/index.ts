// Set up the require patch for aliases.
import "../core/makeAlias";

import { ipcRenderer, contextBridge } from "electron";
import path from "path";
import injectRendererModule from "#kernel/core/utils/injectRendererModule";
import * as packageLoader from "#kernel/core/packageLoader/index";
import Logger from "#kernel/core/Logger";
import getWebPreference from "#kernel/core/utils/getWebPreference";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

// If context isolation is off, this should be patched to make sure everything complies.
const hasContextIsolation = getWebPreference("contextIsolation");

Logger.log("ContextIsolation:", hasContextIsolation);
if (!hasContextIsolation) {
	contextBridge.exposeInMainWorld = function (key, value) {
		window[key] = value;
	};
}

// Initialize the renderer bridge.
require("#kernel/preload/bridge");

packageLoader.loadPackages(packageLoader.getOgre(), false);

Logger.log(path.join(__dirname, "..", "renderer", "index.js"));
injectRendererModule({
	script: path.join(__dirname, "..", "renderer", "index.js"),
	sync: true,
});

if (preloadData?.originalPreload) {
	Logger.log("Running original preload:", preloadData.originalPreload);
	require(preloadData.originalPreload);
}
