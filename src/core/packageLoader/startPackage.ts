import loadedPackages from "./getPackages";
import { ipcMain } from "electron";

export default function startPackage(packageID: string) {
	if (loadedPackages[packageID]) {
		console.log(`Starting package ${packageID}`);
		ipcMain.emit("KERNEL_PACKAGE_START", packageID);
		loadedPackages[packageID].instance.start?.();
	}
}
