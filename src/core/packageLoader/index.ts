import getPackages from "./getPackages";
import getPackagesPath from "./getPackagesPath";
import getOgre from "./getOgre";
import loadPackage from "./loadPackage";
import loadPackages from "./loadPackages";
import type PackageInfo from "./PackageInfo";
import type Ogre from "./Ogre";
import loadedPackages from "./loadedPackages";
import startPackage from "./startPackage";
import stopPackage from "./stopPackage";

import processLocation from "../utils/processLocation";

export {
	getPackages,
	getPackagesPath,
	getOgre,
	loadPackage,
	loadPackages,
	loadedPackages,
	PackageInfo,
	Ogre,
	startPackage,
	stopPackage,
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
		break;
	default:
		break;
}
