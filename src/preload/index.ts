import { contextBridge, ipcRenderer } from "electron";
import path from "path";
import injectRendererModule from "../core/injectRendererModule";
import * as packageLoader from "../core/packageLoader";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// Initialize the renderer bridge.
require("./renderer/bridge/index.js");

packageLoader.loadPackages(packageLoader.getOgre(), false);

injectRendererModule({
	script: path.join(__dirname, "renderer", "index.js"),
});

// const packagesPath = packageLoader.getPackagesPath();
// const ogre = packageLoader.getOgre();

// for (const layer of ogre) {
// 	for (const packageID of layer) {
// 		const packagePreload = path.join(packagesPath, packageID, "preload.js");
// 		const packageRenderer = path.join(packagesPath, packageID, "renderer.js");

// 		// if (fs.existsSync(packagePreload)) {
// 		// 	console.log(require(packagePreload));
// 		// }
// 	}
// }

// This is in the preload so we need to use the IPC to get the data from the main process where the BrowserWindow is injected.
const preloadData = ipcRenderer.sendSync("KERNEL_WINDOW_DATA");

// If context isolation is off, this should be patched to make sure everything complies.
if (!preloadData?.contextIsolation) {
	contextIsolation.exposeInMainWorld = (key, value) => window[key] = value; 
}

if (preloadData?.originalPreload) {
	require(preloadData.originalPreload);
}
