// Set up the require patch for aliases.
import "../main/alias";
import { ipcRenderer, contextBridge } from "electron";
import path from "path";
import injectRendererModule from "#kernel/core/utils/injectRendererModule";
import * as packageLoader from "#kernel/core/packageLoader";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

// If context isolation is off, this should be patched to make sure everything complies.
if (!preloadData.windowOptions.webPreferences.contextIsolation) {
	contextBridge.exposeInMainWorld = function (key, value) {
		window[key] = value;
	};
}

// Initialize the renderer bridge.
require("#kernel/preload/bridge");

packageLoader.loadPackages(packageLoader.getOgre(), false);

injectRendererModule({
	script: path.join(__dirname, "..", "renderer", "index.js"),
});

if (preloadData.originalPreload) {
	require(preloadData.originalPreload);
}
