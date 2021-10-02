import loadedPackages from "./getPackages";
import { ipcMain } from "electron";

export default function stopPackage(packageID: string) {
	if (loadedPackages[packageID]) {
		console.log(`Stopping package ${packageID}`);
		ipcMain.emit("KERNEL_PACKAGE_STOP", packageID);
		loadedPackages[packageID].instance.stop?.();
	}
}
