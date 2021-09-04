import { ipcRenderer } from "electron";
import * as path from "path";
import injectRendererModule from "./injectRendererModule";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// Initialize the renderer bridge.
import("./rendererBridge");

injectRendererModule({
	script: path.join(__dirname, "renderer.js"),
	onload: () => ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK"),
});

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");
if (preloadData?.originalPreload) {
	console.log(preloadData);
	import(preloadData.originalPreload);
}
