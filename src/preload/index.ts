// Set up the require patch for aliases.
import "../main/alias";

import { ipcRenderer } from "electron";
import path from "path";
import injectRendererModule from "#kernel/core/injectRendererModule";
import * as packageLoader from "#kernel/core/packageLoader";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// Initialize the renderer bridge.
require("./renderer/bridge/index.js");

packageLoader.loadPackages(packageLoader.getOgre(), false);

injectRendererModule({
	script: path.join(__dirname, "renderer", "index.js"),
});

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

if (preloadData?.originalPreload) {
	require(preloadData.originalPreload);
}
