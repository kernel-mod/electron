import loadedPackages from "./getPackages";
import { ipcMain, ipcRenderer } from "electron";
import processLocation from "../processLocation";

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_startPackage", (event, packageID: string) => {
			startPackage(packageID, false);
		});
		break;
	case "PRELOAD":
		ipcRenderer.on("KERNEL_startPackage", (event, packageID: string) => {
			startPackage(packageID, false);
		});
		break;
}

export default function startPackage(
	packageID: string,
	broadcast: boolean = true
) {
	if (loadedPackages[packageID]) {
		if (broadcast) {
			switch (processLocation()) {
				case "MAIN":
					ipcMain.emit("KERNEL_PACKAGE_START", packageID);
					break;
				case "PRELOAD":
					ipcRenderer.emit("KERNEL_PACKAGE_START", packageID);
					break;
			}
		}
		loadedPackages[packageID].instance.start?.();
	}
}
