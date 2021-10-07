import fs from "fs";
import path from "path";
import PackageInfo from "./PackageInfo";
import getPackagesPath from "./getPackagesPath";
import processLocation from "../processLocation";
import { ipcMain, ipcRenderer } from "electron";

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
					const packagePath = path.join(packagesPath, packageDir);
					const packageInfo: PackageInfo = JSON.parse(
						fs.readFileSync(path.join(packagePath, "index.json"), "utf8")
					);
					packageInfo.path = packagePath;
					packages[packageInfo.id] = packageInfo;
				}

				return packages;
			} catch {
				return {};
			}
		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackages");
	}
}
