import fs from "fs";
import path from "path";
import memoize from "../memoize";
import processLocation from "../processLocation";
import { ipcMain, ipcRenderer } from "electron";

switch (processLocation()) {
	case "MAIN":
		ipcMain.on("KERNEL_getPackagesPath", (event) => {
			event.returnValue = getPackagesPath();
		});
		break;
}

// A function that goes up parent directories until it finds a folder named "packages".
function getPackagesPath(): string {
	switch (processLocation()) {
		case "MAIN":
			const kernelPath = [__dirname, "..", "..", ".."]; //back out of ASAR
			
			while (
				!fs.existsSync(path.resolve(...kernelPath, "packages")) ||
				!path.resolve(...kernelPath) === "/"  ||
				!path.resolve(...kernelPath) === "C:"
			) {
			  kernelPath.push("..");
			}

			const packagesPath = path.resolve(...kernelPath, "packages");
			
			// TODO: when i'm on a better code editor restore automatic package folder creation
	
			return packagesPath;

			

		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackagesPath");
	}
}

export default memoize(getPackagesPath);
