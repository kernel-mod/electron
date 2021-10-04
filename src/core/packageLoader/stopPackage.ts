import loadedPackages from "./getPackages";
import { ipcMain, ipcRenderer } from "electron";
import processLocation from "../processLocation";

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_stopPackage", (event, packageID: string) => {
			stopPackage(packageID, false);
		});
		break;
	case "PRELOAD":
		ipcRenderer.on("KERNEL_stopPackage", (event, packageID: string) => {
			stopPackage(packageID, false);
		});
		break;
}

export default function stopPackage(
	packageID: string,
	broadcast: boolean = true
) {
	if (loadedPackages[packageID]) {
		if (broadcast) {
			switch (processLocation()) {
				case "MAIN":
					ipcMain.emit("KERNEL_PACKAGE_STOP", packageID);
					break;
				case "PRELOAD":
					ipcRenderer.emit("KERNEL_PACKAGE_STOP", packageID);
					break;
			}
		}
		loadedPackages[packageID].instance.stop?.();
	}
}
