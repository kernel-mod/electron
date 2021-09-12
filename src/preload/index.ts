import { ipcRenderer } from "electron";
import path from "path";
import injectRendererModule from "./injectRendererModule";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// Initialize the renderer bridge.
require("./rendererBridge");

const packageLoader = require("../packageLoader");
packageLoader.init("preload");
console.log("pre", packageLoader.loadedPackages);

injectRendererModule({
	script: path.join(__dirname, "renderer.js"),
	onload: () => ipcRenderer.sendSync("KERNEL_FINISH_RENDERER_HOOK"),
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
const preloadData = ipcRenderer.sendSync("KERNEL_PRELOAD_DATA");
if (preloadData?.originalPreload) {
	import(preloadData.originalPreload);
}
