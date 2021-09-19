import chokidar from "chokidar";
import getPackages from "./getPackages";
import getPackagesPath from "./getPackagesPath";
import getOgre from "./getOgre";
import loadPackage from "./loadPackage";
import loadPackages from "./loadPackages";
import PackageInfo from "./PackageInfo";
import Ogre from "./Ogre";
import loadedPackages from "./loadedPackages";
import { ipcMain } from "electron";
import processLocation from "../processLocation";

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

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_getOgre", (event) => {
			event.returnValue = getOgre();
		});
		ipcMain.handle("KERNEL_getPackages", (event) => {
			event.returnValue = getPackages();
		});
		ipcMain.handle("KERNEL_getPackagesPath", (event) => {
			event.returnValue = getPackagesPath();
		});
		break;
	case "PRELOAD":
		break;
	case "RENDERER":
		break;
}
