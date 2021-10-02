import getPackages from "./getPackages";
import getPackagesPath from "./getPackagesPath";
import getOgre from "./getOgre";
import loadPackage from "./loadPackage";
import loadPackages from "./loadPackages";
import PackageInfo from "./PackageInfo";
import Ogre from "./Ogre";
import loadedPackages from "./loadedPackages";
import startPackage from "./startPackage";
import stopPackage from "./stopPackage";

import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export {
	getPackages,
	getPackagesPath,
	getOgre,
	loadPackage,
	loadPackages,
	loadedPackages,
	PackageInfo,
	Ogre,
};

// // A debounce function.
// export function debounce(
// 	func: (...args: any[]) => void,
// 	wait: number,
// 	immediate?: boolean
// ) {
// 	let timeout;
// 	return function (...args: any[]) {
// 		const context = this;
// 		const later = function () {
// 			timeout = null;
// 			if (!immediate) func.apply(context, args);
// 		};
// 		const callNow = immediate && !timeout;
// 		clearTimeout(timeout);
// 		timeout = setTimeout(later, wait);
// 		if (callNow) func.apply(context, args);
// 	};
// }

ipcMain.handle("KERNEL_getOgre", (event) => {
	event.returnValue = getOgre();
});
ipcMain.handle("KERNEL_getPackages", (event) => {
	event.returnValue = getPackages();
});
ipcMain.handle("KERNEL_getPackagesPath", (event) => {
	event.returnValue = getPackagesPath();
});

ipcMain.on("KERNEL_getRendererPackages", (event) => {
	const ogre = getOgre();
	const packages = getPackages();

	const ogrePaths = [];

	for (const layer of ogre) {
		const layerPaths = [];
		for (const packageID of Object.keys(layer)) {
			// Renderer is expected to be bundled so this should work fine.
			const rendererPath = path.join(packages[packageID].path, "renderer.js");
			if (fs.existsSync(rendererPath)) {
				layerPaths.push(rendererPath);
			}
		}
		if (layerPaths.length > 0) ogrePaths.push(layerPaths);
	}

	event.returnValue = ogrePaths;
});

ipcMain.on("KERNEL_startPackage", (event, packageID: string) => {
	startPackage(packageID);
});
ipcMain.on("KERNEL_stopPackage", (event, packageID: string) => {
	stopPackage(packageID);
});
