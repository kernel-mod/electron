import fs from "fs";
import path from "path";
import PackageInfo from "./PackageInfo";
import getPackagesPath from "./getPackagesPath";
import processLocation from "../utils/processLocation";
import { ipcMain, ipcRenderer } from "electron";
import loadedPackages from "./loadedPackages";

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_getPackages", (event) => {
			event.returnValue = getPackages();
		});
		break;
}

export default function getPackages(): {
	[id: string]: PackageInfo;
} {
	switch (processLocation()) {
		case "MAIN":
			const packagesPath = getPackagesPath();
			const packages: {
				[id: string]: PackageInfo;
			} = {};
			try {
				const packageDirs = fs.readdirSync(packagesPath);

				for (const packageDir of packageDirs) {
					try {
						const packagePath = path.join(packagesPath, packageDir);
						const packageInfo: PackageInfo = JSON.parse(
							fs.readFileSync(path.join(packagePath, "index.json"), "utf8")
						);

						// Automatically start new packages.
						packageInfo.enabled = loadedPackages[
							packageInfo.id
						]?.hasOwnProperty("enabled")
							? !!loadedPackages[packageInfo.id].enabled
							: true;

						packageInfo.path = packagePath;
						packages[packageInfo.id] = packageInfo;
					} catch (e) {
						console.error(`Invalid package "${packageDir}":`, e.message);
					}
				}

				return packages;
			} catch (e) {
				console.error(e);
				return {};
			}
		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackages");
	}
}
