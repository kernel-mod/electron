import chokidar from "chokidar";
import getPackages from "./getPackages";
import getPackagesPath from "./getPackagesPath";
import getOgre from "./getOgre";
import loadPackage from "./loadPackage";
import loadPackages from "./loadPackages";
import PackageInfo from "./PackageInfo";
import Ogre from "./Ogre";
import loadedPackages from "./loadedPackages";

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

export function init(context: string) {
	loadPackages(getOgre(), context);
}

// chokidar.watch(getPackagesPath()).on("all", (event, path) => {
// 	const packages = getPackages();
// 	switch (event) {
// 		case "add":
// 			loadPackage(getPa);
// 			break;
// 		case "change":
// 			loadPackage(packageInfo);
// 			break;
// 		case "unlink":
// 			getOgre().unloadPackage(packageInfo);
// 			break;
// 		default:
// 			break;
// 	}
// });
