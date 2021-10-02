import { ipcRenderer } from "electron";
import path from "path";
import injectRendererModule from "../core/injectRendererModule";

ipcRenderer.sendSync("KERNEL_SETUP_RENDERER_HOOK");

// Initialize the renderer bridge.
require("./rendererBridge");

// const { packageLoader } = require("../core");
// packageLoader.loadPackages(packageLoader.getOgre());

injectRendererModule({
	script: path.join(__dirname, "renderer.js"),
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
	require(preloadData.originalPreload);
}
