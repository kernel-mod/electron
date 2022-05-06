import fs from "fs";
import path from "path";
import memoize from "../utils/memoize";
import processLocation from "../utils/processLocation";
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
			const kernelPath = path.join(__dirname, "..", "..", "..");
			const packagesPath = path.resolve(kernelPath, "packages");

			if (!fs.existsSync(packagesPath)) {
				console.log(
					`No package directory found. Creating one at "${packagesPath}"`
				);
				fs.mkdirSync(packagesPath);
			}

			return packagesPath;

		case "PRELOAD":
			return ipcRenderer.sendSync("KERNEL_getPackagesPath");
	}
}

export default memoize(getPackagesPath);
